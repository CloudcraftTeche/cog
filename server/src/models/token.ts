

import { Schema, model, Document,Types } from 'mongoose';

interface IToken extends Document{
    token:string;
    userId:Schema.Types.ObjectId ; 
}



const TokenSchema = new Schema<IToken>({
    token: {
        type: String,
        required: true,
        unique: true,
    },
    userId: {
        type: Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true });

export default model<IToken>('Token', TokenSchema);