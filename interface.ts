/// <reference path="typings/node/node.d.ts" />
/// <reference path="typings/mongoose/mongoose.d.ts" />

declare namespace postis {
    
    // extends mongoose.Document
    interface IPostis {
        _id: string;
        text: string,
        color: string,
        position: { top: number, left: number },
        isShown: boolean,
        creator: string,
        eventId: string
    }
}