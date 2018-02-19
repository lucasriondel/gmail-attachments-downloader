declare module 'base64topdf' {
    function base64Encode(file: string) : void;
    function base64Decode(base64str: string, file: string) : void;
    function rtfToText(rtfStr: string) : string;
    function textToRtf(textStr: string) : string;
    function strToBase64(str: string) : string;
    function base64ToStr(base64Str: string) : string;

    export {
        base64Encode,
        base64Decode,
        rtfToText,
        textToRtf,
        strToBase64,
        base64ToStr
    }
}