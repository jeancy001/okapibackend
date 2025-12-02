import mongoose  from "mongoose";


const ContactSchema = new mongoose.Schema(
    {
        username:{type:String, required:true},
        email:{type:String, required:true},
        message:{type:String, required:true},
    },{timestamps:true}
)
export const Contacts  = mongoose.model("Contacts", ContactSchema)