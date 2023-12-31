// Needed Resource
const utilities = require("../utilities")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
        title: "Login",
        nav,
        errors: null,
    })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/register", {
        title: "Register",
        nav,
        errors: null,
    })
}

/* ****************************************
*  Deliver management view
* *************************************** */
async function buildManagement(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/management", {
        title: "Management",
        nav,
        errors: null,
    })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body

    // Hash the password before storing
    let hashedPassword
    try {
        // regular password and cost (salt is generated automatically)
        hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (error) {
        req.flash("notice", 'Sorry, there was an error processing the registration.')
        res.status(500).render("account/register", {
            title: "Registration",
            nav,
            errors: null,
        })
    }

    const regResult = await accountModel.registerAccount(
        account_firstname,
        account_lastname,
        account_email,
        hashedPassword
    )

    if (regResult) {
        req.flash(
            "notice",
            `Congratulations,  you\'re registered ${account_firstname}. Please log in.`
        )
        res.status(201).render("account/login", {
            title: "Login",
            nav,
            errors: null,
        })
    } else {
        req.flash("notice", "Sorry, the registration failed.")
        res.status(501).render("account/register", {
            title: "Registration",
            nav,
        })
    }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
    let nav = await utilities.getNav()
    const { account_email, account_password } = req.body
    const accountData = await accountModel.getAccountByEmail(account_email)
    if (!accountData) {
        req.flash("notice", "Please check your credentials and try again.")
        res.status(400).render("account/login", {
            title: "Login",
            nav,
            errors: null,
            account_email,
        })
        return
    }
    try {
        if (await bcrypt.compare(account_password, accountData.account_password)) {
            delete accountData.account_password
            const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
            res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
            return res.redirect("/account/")
        }
    } catch (error) {
        return new Error('Access Forbidden')
    }
}

// function isLoggedIn(req) {
//     const token = req.cookies.jwt; // Assuming you store the token in a cookie
  
//     if (token) {
//       try {
//         const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
//         return decoded; // Returns the decoded user data if the token is valid
//       } catch (error) {
//         return null; // Token is invalid or expired
//       }
//     } else {
//       return null; // No token found
//     }
//   }

/* ****************************************
*  Deliver update view
* *************************************** */
async function buildUpdate(req, res, next) {
    const account_id = req.params.account_id
    let nav = await utilities.getNav()
    const accountData = await accountModel.getAccountById(account_id)
    res.render("account/update", {
        title: "Edit Account",
        nav,
        errors: null,
        account_data: accountData.account_id,
    })
}

/* ****************************************
*  Process update
* *************************************** */
// async function updateAccount(req, res) {
//     let nav = await utilities.getNav()
//     const { account_firstname, account_lastname, account_email } = req.body

//     const updateResult = await accountModel.updateAccount(
//         account_firstname,
//         account_lastname,
//         account_email
//     )

//     if (updateResult) {
//         req.flash(
//             "notice",
//             "Account updated successfully."
//         )
//         res.status(201).render("account/management", {
//             title: "Management",
//             nav,
//             errors: null,
//         })
//     } else {
//         req.flash("notice", "Sorry, the update failed.")
//         res.status(501).render("account/update", {
//             title: "Edit Account",
//             nav,
//             errors: null,
//         })
//     }
// }

async function updateAccount(req, res) {
    let nav = await utilities.getNav();
    const { account_id, account_firstname, account_lastname, account_email } = req.body;

    try {
        const updateResult = await accountModel.updateAccount(
            account_id,
            account_firstname,
            account_lastname,
            account_email
        );

        if (updateResult) {
            req.flash("notice", "Account updated successfully.");
            res.status(201).render("account/management", {
                title: "Management",
                nav,
                errors: null,
            });
        } else {
            req.flash("notice", "Sorry, the update failed.");
            res.status(501).render("account/update", {
                title: "Edit Account",
                nav,
                errors: null,
            });
        }
    } catch (error) {
        console.error('Error updating account:', error);
        req.flash("error", "An error occurred during the update.");
        res.status(500).render("account/update", {
            title: "Edit Account",
            nav,
            errors: null,
        });
    }
}


/* ****************************************
*  Process update password change
* *************************************** */
// async function updatePassword(req, res) {
//     let nav = await utilities.getNav()
//     const { account_password } = req.body

//     // Hash the password before storing
//     let newHashedPassword
//     try {
//         // regular password and cost (salt is generated automatically)
//         newHashedPassword = await bcrypt.hashSync(account_password, 10)
//     } catch (error) {
//         req.flash("notice", 'Sorry, there was an error processing the update.')
//         res.status(500).render("account/management", {
//         title: "Management",
//         nav,
//         errors: null,
//     })
//     }

//     const updateResult = await accountModel.updatePassword(account_id, newHashedPassword)

//     if (updateResult) {
//         req.flash(
//             "notice",
//             "Password changed successfully."
//         )
//         return res.status(201).render("account/management", {
//             title: "Management",
//             nav,
//             errors: null,
//         })
//     }
// }



/* ****************************************
*  Processing the updated password
* *************************************** */
// async function updatePassword(req, res) {
//     let nav = await utilities.getNav()
//     const { account_password, account_id } = req.body
  
//     let hashedPassword
//     try {
//       hashedPassword = await bcrypt.hashSync(account_password, 10)
//     } catch (error) {
//       req.flash("notice", 'Sorry, there was an error processing the registration.')
//       res.status(500).render("account/change-password", {
//         title: "Registration",
//         nav,
//         errors: null,
//       })
//     }
   
//     const regResult = await accountModel.updatePassword(hashedPassword, account_id)
    
//     if (regResult) {
//       const account = await accountModel.getAccountById(account_id)
//       req.flash("success", 'Congratulations, ${account.account_firstname} your Password has been updated successfully.')
//       return res.redirect("/account/");
//       // res.status(201).render("/account/", {
//       //   title: "Account Management",
//       //   nav,
//       //   errors:null,
//       //   account_firstname: account.account_firstname,
//       // })
//     } else {
      
//       req.flash("error", "Sorry, the update failed.")
//       res.status(501).render("account/change-password", {
//         title: "Edit Account Information",
//         nav,
//         errors: null,
//       })
//     }
//   }

async function updatePassword(req, res) {
    let nav = await utilities.getNav()
    const { account_password, account_id } = req.body
  
    let hashedPassword
    try {
      hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (error) {
      req.flash("notice", 'Sorry, there was an error processing the registration.')
      res.status(500).render("account/update", {
        title: "Registration",
        nav,
        errors: null,
      })
    }
   
    const regResult = await accountModel.updatePassword(hashedPassword, account_id)
    
    if (regResult) {
      const account = await accountModel.getAccountById(account_id)
      req.flash("success", `Congratulations, ${account.account_firstname} your Password has been updated successfully.`)
      return res.redirect("/account/");
      // res.status(201).render("/account/", {
      //   title: "Account Management",
      //   nav,
      //   errors:null,
      //   account_firstname: account.account_firstname,
      // })
    } else {
      
      req.flash("notice", "Sorry, the update failed.")
      res.status(501).render("account/update", {
        title: "Edit Account Information",
        nav,
        errors: null,
      })
    }
  }

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildManagement, buildUpdate, updateAccount, updatePassword }
