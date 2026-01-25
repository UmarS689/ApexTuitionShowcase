// sessionCheckTutor.js

/**
 * If session has expired, cookie has expired then they are asked to log in again.
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns the next webpage if logged in, otherwise the login page.
 */
module.exports = (req, res, next) => {
  console.log(`Session Check Student: Incoming request: ${req.method} ${req.url}`);
  if (!req.session.user) {
    console.log("EXPIRED");
    return res.redirect('/student/login.html?message=Please log in.&type=error');
  } else {
    if (req.session.user.role !== "student"){
      console.log("Wrong Role");
      return res.redirect('/student/login.html?message=Please log in.&type=error');
    }
  }
  next();
};