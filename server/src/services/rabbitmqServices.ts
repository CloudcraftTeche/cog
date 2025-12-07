import amqp from "amqplib";
import { EventEmitter } from "events";
export const QUEUE_NAMES = {
  CHAT_EVENTS: "chat_events",
  MESSAGE_EVENTS: "message_events",
  MODERATION_EVENTS: "moderation_events",
  NOTIFICATION_EVENTS: "notification_events",
  USER_STATUS_EVENTS: "user_status_events",
  QUERY_EVENTS: "query_events", 
};
class RabbitMQService extends EventEmitter {
  private connection: amqp.Connection | null | any = null;
  private channel: amqp.Channel | null = null;
  private readonly url: string;
  constructor(url: string = process.env.RABBITMQ_URL || "amqp://localhost") {
    super();
    this.url = url;
  }
  async connect(): Promise<void> {
    try {
      console.log("Connecting to RabbitMQ...");
      this.connection = await amqp.connect(this.url);
      this.channel = await this.connection.createChannel();
      this.connection.on("error", (err: any) => {
        console.error("RabbitMQ connection error:", err);
        this.emit("error", err);
      });
      this.connection.on("close", () => {
        console.log("RabbitMQ connection closed");
        this.emit("disconnect");
      });
      await this.setupQueues();
      console.log("RabbitMQ connected successfully");
      this.emit("connected");
    } catch (error) {
      console.error("Failed to connect to RabbitMQ:", error);
      throw error;
    }
  }
  private async setupQueues(): Promise<void> {
    if (!this.channel) throw new Error("Channel not initialized");
    const queues = Object.values(QUEUE_NAMES);
    for (const queueName of queues) {
      await this.channel.assertQueue(queueName, {
        durable: true,
        arguments: {
          "x-message-ttl": 86400000, 
        },
      });
      console.log(`Queue ${queueName} asserted`);
    }
  }
  async publishToQueue(queueName: string, data: any): Promise<boolean> {
    try {
      if (!this.channel) {
        console.warn("Channel not available, attempting to reconnect...");
        await this.connect();
      }
      const message = JSON.stringify({
        ...data,
        timestamp: data.timestamp || new Date(),
        id: data.id || Math.random().toString(36).substring(7),
      });
      const sent = this.channel!.sendToQueue(queueName, Buffer.from(message), {
        persistent: true,
        messageId: data.id || Math.random().toString(36).substring(7),
        timestamp: Date.now(),
      });
      if (sent) {
        console.log(
          `Message published to ${queueName}:`,
          data.type || "UNKNOWN"
        );
      }
      return sent;
    } catch (error) {
      console.error(`Failed to publish to queue ${queueName}:`, error);
      throw error;
    }
  }
  async subscribeToQueue(
    queueName: string,
    handler: (
      data: any,
      ack: () => void,
      nack: (requeue?: boolean) => void
    ) => void
  ): Promise<void> {
    try {
      if (!this.channel) {
        await this.connect();
      }
      await this.channel!.consume(queueName, async (msg) => {
        if (!msg) return;
        try {
          const data = JSON.parse(msg.content.toString());
          console.log(
            `Processing message from ${queueName}:`,
            data.type || "UNKNOWN"
          );
          const ack = () => this.channel!.ack(msg);
          const nack = (requeue: boolean = false) =>
            this.channel!.nack(msg, false, requeue);
          await handler(data, ack, nack);
        } catch (error) {
          console.error(`Error processing message from ${queueName}:`, error);
          this.channel!.nack(msg, false, false);
        }
      });
      console.log(`Subscribed to queue: ${queueName}`);
    } catch (error) {
      console.error(`Failed to subscribe to queue ${queueName}:`, error);
      throw error;
    }
  }
  async getQueueInfo(queueName: string): Promise<amqp.Replies.AssertQueue> {
    if (!this.channel) throw new Error("Channel not initialized");
    return await this.channel.checkQueue(queueName);
  }
  async purgeQueue(queueName: string): Promise<amqp.Replies.PurgeQueue> {
    if (!this.channel) throw new Error("Channel not initialized");
    return await this.channel.purgeQueue(queueName);
  }
  async close(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }
      if (this.connection) {
        await this.connection.close();
        this.connection = null;
      }
      console.log("RabbitMQ connection closed");
    } catch (error) {
      console.error("Error closing RabbitMQ connection:", error);
    }
  }
  isConnected(): boolean {
    return this.connection !== null && this.channel !== null;
  }
}
const rabbitmqService = new RabbitMQService();
export const messageHandlers = {
  async handleChatEvents(
    data: any,
    ack: () => void,
    nack: (requeue?: boolean) => void
  ) {
    try {
      console.log("Processing chat event:", data);
      switch (data.type) {
        case "CHAT_CREATED":
          await rabbitmqService.publishToQueue(
            QUEUE_NAMES.NOTIFICATION_EVENTS,
            {
              type: "CHAT_CREATED_NOTIFICATION",
              recipients: data.participants,
              chatId: data.chatId,
              chatType: data.chatType,
              createdBy: data.createdBy,
            }
          );
          break;
        case "PRIVATE_CHAT_CREATED":
          await rabbitmqService.publishToQueue(
            QUEUE_NAMES.NOTIFICATION_EVENTS,
            {
              type: "PRIVATE_CHAT_NOTIFICATION",
              recipients: data.participants,
              chatId: data.chatId,
              createdBy: data.createdBy,
            }
          );
          break;
        default:
          console.log("Unknown chat event type:", data.type);
      }
      ack();
    } catch (error) {
      console.error("Error handling chat event:", error);
      nack(true);
    }
  },
  async handleMessageEvents(
    data: any,
    ack: () => void,
    nack: (requeue?: boolean) => void
  ) {
    try {
      console.log("Processing message event:", data);
      switch (data.type) {
        case "MESSAGE_SENT":
          await rabbitmqService.publishToQueue(
            QUEUE_NAMES.NOTIFICATION_EVENTS,
            {
              type: "NEW_MESSAGE_NOTIFICATION",
              recipients: data.participants.filter(
                (id: string) => id !== data.senderId
              ),
              messageId: data.messageId,
              chatId: data.chatId,
              senderId: data.senderId,
              content: data.content.substring(0, 100),
              messageType: data.messageType,
            }
          );
          await rabbitmqService.publishToQueue(QUEUE_NAMES.USER_STATUS_EVENTS, {
            type: "USER_ACTIVITY",
            userId: data.senderId,
            activity: "message_sent",
            chatId: data.chatId,
          });
          break;
        case "REALTIME_MESSAGE":
          break;
        default:
          console.log("Unknown message event type:", data.type);
      }
      ack();
    } catch (error) {
      console.error("Error handling message event:", error);
      nack(true);
    }
  },
  async handleModerationEvents(
    data: any,
    ack: () => void,
    nack: (requeue?: boolean) => void
  ) {
    try {
      console.log("Processing moderation event:", data);
      switch (data.type) {
        case "MESSAGE_MODERATED":
          await rabbitmqService.publishToQueue(
            QUEUE_NAMES.NOTIFICATION_EVENTS,
            {
              type: "MODERATION_NOTIFICATION",
              messageId: data.messageId,
              action: data.action,
              moderatedBy: data.moderatedBy,
              reason: data.reason,
            }
          );
          break;
        default:
          console.log("Unknown moderation event type:", data.type);
      }
      ack();
    } catch (error) {
      console.error("Error handling moderation event:", error);
      nack(true);
    }
  },
  async handleQueryEvents(
    data: any,
    ack: () => void,
    nack: (requeue?: boolean) => void
  ) {
    try {
      console.log("Processing query event:", data);
      switch (data.type) {
        case "QUERY_CREATED":
          await rabbitmqService.publishToQueue(
            QUEUE_NAMES.NOTIFICATION_EVENTS,
            {
              type: "QUERY_EMAIL_NOTIFICATION",
              recipient: data.to,
              subject: `New Query: ${data.subject}`,
              queryId: data.queryId,
              from: data.from,
              priority: data.priority,
              queryType: data.queryType,
            }
          );
          await rabbitmqService.publishToQueue(
            QUEUE_NAMES.NOTIFICATION_EVENTS,
            {
              type: "UPDATE_QUERY_STATS",
              action: "created",
              queryType: data.queryType,
              priority: data.priority,
            }
          );
          break;
        case "QUERY_RESPONSE":
          await rabbitmqService.publishToQueue(
            QUEUE_NAMES.NOTIFICATION_EVENTS,
            {
              type: "QUERY_RESPONSE_EMAIL",
              recipient: data.queryOwner,
              queryId: data.queryId,
              responseFrom: data.responseFrom,
              subject: data.subject,
              responseContent: data.responseContent,
            }
          );
          break;
        case "QUERY_STATUS_UPDATED":
          await rabbitmqService.publishToQueue(
            QUEUE_NAMES.NOTIFICATION_EVENTS,
            {
              type: "QUERY_STATUS_EMAIL",
              recipient: data.queryOwner,
              queryId: data.queryId,
              status: data.status,
              updatedBy: data.updatedBy,
            }
          );
          await rabbitmqService.publishToQueue(
            QUEUE_NAMES.NOTIFICATION_EVENTS,
            {
              type: "UPDATE_QUERY_STATS",
              action: "status_changed",
              status: data.status,
            }
          );
          break;
        case "QUERY_ESCALATED":
          await rabbitmqService.publishToQueue(
            QUEUE_NAMES.NOTIFICATION_EVENTS,
            {
              type: "QUERY_ESCALATION_NOTIFICATION",
              escalatedTo: data.escalatedTo,
              queryId: data.queryId,
              escalationReason: data.escalationReason,
              escalatedBy: data.escalatedBy,
              priority: "urgent",
            }
          );
          break;
        default:
          console.log("Unknown query event type:", data.type);
      }
      ack();
    } catch (error) {
      console.error("Error handling query event:", error);
      nack(true);
    }
  },
  async handleNotificationEvents(
    data: any,
    ack: () => void,
    nack: (requeue?: boolean) => void
  ) {
    try {
      console.log("Processing notification event:", data);
      switch (data.type) {
        case "QUERY_EMAIL_NOTIFICATION":
          console.log(`Sending email to ${data.recipient} for query ${data.queryId}`);
          break;
        case "QUERY_RESPONSE_EMAIL":
          console.log(`Sending response email to ${data.recipient}`);
          break;
        case "QUERY_STATUS_EMAIL":
          console.log(`Sending status update email to ${data.recipient}`);
          break;
        case "UPDATE_QUERY_STATS":
          console.log("Updating query statistics:", data);
          break;
        default:
          console.log("Unknown notification event type:", data.type);
      }
      ack();
    } catch (error) {
      console.error("Error handling notification event:", error);
      nack(false);
    }
  },
  async handleUserStatusEvents(
    data: any,
    ack: () => void,
    nack: (requeue?: boolean) => void
  ) {
    try {
      console.log("Processing user status event:", data);
      switch (data.type) {
        case "USER_ACTIVITY":
          break;
        case "USER_ONLINE":
        case "USER_OFFLINE":
          break;
        default:
          console.log("Unknown user status event type:", data.type);
      }
      ack();
    } catch (error) {
      console.error("Error handling user status event:", error);
      nack(true);
    }
  },
};
export async function initializeMessageHandlers(): Promise<void> {
  try {
    await rabbitmqService.subscribeToQueue(
      QUEUE_NAMES.CHAT_EVENTS,
      messageHandlers.handleChatEvents
    );
    await rabbitmqService.subscribeToQueue(
      QUEUE_NAMES.MESSAGE_EVENTS,
      messageHandlers.handleMessageEvents
    );
    await rabbitmqService.subscribeToQueue(
      QUEUE_NAMES.MODERATION_EVENTS,
      messageHandlers.handleModerationEvents
    );
    await rabbitmqService.subscribeToQueue(
      QUEUE_NAMES.QUERY_EVENTS,
      messageHandlers.handleQueryEvents
    );
    await rabbitmqService.subscribeToQueue(
      QUEUE_NAMES.NOTIFICATION_EVENTS,
      messageHandlers.handleNotificationEvents
    );
    await rabbitmqService.subscribeToQueue(
      QUEUE_NAMES.USER_STATUS_EVENTS,
      messageHandlers.handleUserStatusEvents
    );
    console.log("All message handlers initialized");
  } catch (error) {
    console.error("Failed to initialize message handlers:", error);
    throw error;
  }
}
export const publishToQueue =
  rabbitmqService.publishToQueue.bind(rabbitmqService);
export const connectToRabbitMQ = rabbitmqService.connect.bind(rabbitmqService);
export const closeRabbitMQConnection =
  rabbitmqService.close.bind(rabbitmqService);
export const isRabbitMQConnected =
  rabbitmqService.isConnected.bind(rabbitmqService);
export default rabbitmqService;