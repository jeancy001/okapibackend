import express from "express"
import { createContacts, deleteContactsById, getAllContacts, getContactById } from "../controllers/contactController.js"

const router = express.Router()


router.post("/create",createContacts);
router.get("/",getAllContacts);
router.get("/:id",getContactById);
router.delete("/:id",deleteContactsById);







export  {router as routerContacts}