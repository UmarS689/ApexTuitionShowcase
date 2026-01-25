const { body, validationResult } = require('express-validator');
const findUser = require('../../utils/findUser'); 
const Message = require('../../models/message');
const studentUser= require('../../models/studentUser');
const verifyReport = require('../../utils/verification/report');
const sendMessageEmail = require('../../utils/email/message');
const Report = require('../../models/report');

/**
 * Sends a message (text or file) to a tutor
 * @param {*} req 
 * @param {*} res 
 * @returns Whether message is successful
 */
exports.sendMessage = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.redirect('/tutor/viewMessage.html?message=Invalid input.&type=error');
  }
  const { content } = req.body;

  try{
    
    // Finds the students and the tutor's data.
    let recipient = await findUser(req, res, "viewMessage", req.session.recipientID, true);
    let user = await findUser(req, res, "viewMessage", req.session.user._id);

    // Create a new message, whether text or file.
    let message = new Message({
      sender: req.session.user._id,
      receiver: recipient._id,
      content: content,
      fromStudent: false,
      tutorRead: true
    });
    if (req.file) {
      message.filename = req.file.filename;
      message.originalname = req.file.originalname;
      message.mimetype =  req.file.mimetype;
      message.size =  req.file.size;
    }
    await message.save();
    
    // Sends email to the tutor that a mesage has been sent.
    await sendMessageEmail(recipient.email, content, recipient.fullName.split(" ")[0], user.fullName.split(" ")[0], message.id);

    res.redirect('/tutor/viewMessage.html');
  } catch (error) {
    console.error(error);
    return res.redirect('/tutor/viewMessage.html?message=Failed to send message .&type=error');

  }
};


/**
 * Returns the messages between a tutor and a user.
 * @param {*} req 
 * @param {*} res 
 * @returns messages
 */
exports.getMessage = async (req, res) => {
  try{
    // Returns all messages between a tutor and a student.
    let recipient = await findUser(req, res, "viewMessage", req.session.recipientID, true);
    let messages = await Message.find({
      $or: [
        { sender: req.session.user._id, receiver: recipient._id },
        { receiver: req.session.user._id, sender:recipient._id }
      ]
    });

    // Ensures all messages have now been read by the student.
    await Message.updateMany(
      {
        $or: [
          { sender: req.session.user._id, receiver: recipient._id },
          { receiver: req.session.user._id, sender:recipient._id }
        ]
      },
      { $set: { tutorRead: true } }
    );
      
    res.json({ messages });
  } catch(error){
    console.error(error);
    return res.redirect('/tutor/viewMessage.html?message=Server error.&type=error');
  }
};