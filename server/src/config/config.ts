import dotenv from "dotenv";
import type ms from "ms";
dotenv.config();
interface Config {
  PORT: number;
  DB_URL: string;
  NODE_ENV: string;
  JWT_SECRET: string;
  whitelistOrigins?: string[];
  JWTACCESSTOKENSECRET: string;
  JWTREFRESHTOKENSECRET: string;
  JWTACCESSTOKENEXPIRESIN:  ms.StringValue;
  JWTREFRESHTOKENEXPIRESIN: ms.StringValue;
}
const config: Config = {
  PORT: parseInt(process.env.PORT || "5000", 10),
  DB_URL: process.env.MONGO_URI || "mongodb://localhost:27017/cogDb",
  NODE_ENV: process.env.NODE_ENV || "development",
  JWT_SECRET: process.env.JWT_SECRET || "EAFUHDSKJFBDSJKFGVHSDV3764872",
  whitelistOrigins: process.env.WHITELISTORIGINS
    ? process.env.WHITELISTORIGINS.split(",")
    : ["http://localhost:3000"],
  JWTACCESSTOKENSECRET: process.env.JWTACCESSTOKENSECRET as string,
  JWTREFRESHTOKENSECRET: process.env.JWTREFRESHTOKENSECRET as string,
  JWTACCESSTOKENEXPIRESIN: process.env
    .JWTACCESSTOKENEXPIRESIN as ms.StringValue,
  JWTREFRESHTOKENEXPIRESIN: process.env
    .JWTREFRESHTOKENEXPIRESIN as ms.StringValue,
};
export default config;
