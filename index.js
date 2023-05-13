//-------------------------------
//all necessary varaibles
const bp = require('body-parser');
const express = require('express');
const ejs = require('ejs');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
var loggedInUserData = { fname: '', lname: '', email: '', id: '', admin: '' };
var alertData = { alert: '' };
var bookedit = { isbn: '', title: '', author: '', category: '' };
var myaccountdata = Object.assign(loggedInUserData, alertData);
const port = 8000;
const app = express();
//----------------------------------
//configuration of express and ejs
app.use(express.static(__dirname));
app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.engine('html', ejs.renderFile);
app.set('views', __dirname + '/views');
//-----------------------------------
// //database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'db2',
});
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Connected to database');
});
//-------------------------------
// index page - get request - displays all available books - home page
app.get('/', function (req, res) {
  const sqlSearch = 'Select * from books WHERE availability = 1';
  alertData.alert = '';
  db.query(sqlSearch, (err, result) => {
    if (err) throw err;
    res.render(
      'index.ejs',
      Object.assign(loggedInUserData, { results: result }, alertData)
    );
  });
});
//-------------------------------
//reservation - post request - responsibile for reservation process
app.post('/reserve', function (req, res) {
  //if user is not logged in redirect to login page
  if (loggedInUserData.id == '') {
    alertData.alert = 'danger3';
    res.render('login.ejs', alertData);
  } else {
    var date = new Date(req.body.reserve).toISOString().split('T')[0]; // 0000-00-00 date format
    var bookid = req.body.idbooks;

    const sqlUpdate = 'UPDATE books SET availability = 0 WHERE idbooks = ?';
    const update_query = mysql.format(sqlUpdate, [bookid]);
    db.query(update_query, (err, result) => {
      if (err) throw err;
      console.log('Availability has been set to 0 ');
    });

    const sqlInsert =
      'INSERT INTO reservations ( fkuserss, fkbooks, date) VALUES (?,?,?)';
    const insert_query = mysql.format(sqlInsert, [
      loggedInUserData.id,
      bookid,
      date,
    ]);
    db.query(insert_query, (err, result) => {
      if (err) throw err;
      console.log(
        'Reservation date:' +
          date +
          ' book id:' +
          bookid +
          ' user id:' +
          loggedInUserData.id
      );
    });
    alertData.alert = 'success';
    const sqlSearch = 'Select * from books WHERE availability = 1';
    db.query(sqlSearch, (err, result) => {
      if (err) throw err;

      res.render(
        'index.ejs',
        Object.assign(loggedInUserData, { results: result }, alertData)
      );
    });
  }
});
//-------------------------------
//search bar - get request - displays only available books containing given word/letters
app.get('/search', function (req, res) {
  let sqlquery =
    "SELECT * FROM books WHERE availability = 1 AND title LIKE '%" +
    req.query.keyword +
    "%'";
  db.query(sqlquery, (err, result) => {
    if (err) throw err;
    res.render(
      'index.ejs',
      Object.assign(loggedInUserData, { results: result })
    );
  });
});
//-------------------------------
//myaccount page - get request - display details of account
app.get('/myaccount', function (req, res) {
  //if user is not logged in redirect to login page
  if (loggedInUserData.id == '') {
    alertData.alert = 'danger3';
    res.render('login.ejs', alertData);
  } else {
    alertData.alert = '';
    myaccountdata = Object.assign(loggedInUserData, alertData);
    res.render('myaccount.ejs', myaccountdata);
  }
});
//-------------------------------
// categories fiction page - get request - displays available books of given category
app.get('/fiction', function (req, res) {
  alertData.alert = '';
  const category = 'fiction';
  const sqlSearch =
    "Select * from books WHERE availability = 1 AND category = 'fiction'";

  db.query(sqlSearch, (err, result) => {
    if (err) throw err;
    res.render(
      'categories.ejs',
      Object.assign(
        loggedInUserData,
        { results: result },
        { category: category },
        alertData
      )
    );
  });
});
//-------------------------------
// categories non-fiction page - get request - displays available books of given category
app.get('/non-fiction', function (req, res) {
  alertData.alert = '';
  const category = 'non-fiction';
  const sqlSearch =
    "Select * from books WHERE availability = 1 AND category = 'non-fiction'";

  db.query(sqlSearch, (err, result) => {
    if (err) throw err;
    res.render(
      'categories.ejs',
      Object.assign(
        loggedInUserData,
        { results: result },
        { category: category },
        alertData
      )
    );
  });
});
//-------------------------------
// categories drama page - get request - displays available books of given category
app.get('/drama', function (req, res) {
  alertData.alert = '';
  const category = 'drama';
  const sqlSearch =
    "Select * from books WHERE availability = 1 AND category = 'drama'";

  db.query(sqlSearch, (err, result) => {
    if (err) throw err;
    res.render(
      'categories.ejs',
      Object.assign(
        loggedInUserData,
        { results: result },
        { category: category },
        alertData
      )
    );
  });
});
//-------------------------------
// categories poetry page - get request - displays available books of given category
app.get('/poetry', function (req, res) {
  alertData.alert = '';
  const category = 'poetry';
  const sqlSearch =
    "Select * from books WHERE availability = 1 AND category = 'poetry'";

  db.query(sqlSearch, (err, result) => {
    if (err) throw err;
    res.render(
      'categories.ejs',
      Object.assign(
        loggedInUserData,
        { results: result },
        { category: category },
        alertData
      )
    );
  });
});
//-------------------------------
// categories other page - get request - displays available books of given category
app.get('/other', function (req, res) {
  alertData.alert = '';
  const category = 'other';
  const sqlSearch =
    "Select * from books WHERE availability = 1 AND category = 'other'";

  db.query(sqlSearch, (err, result) => {
    if (err) throw err;
    res.render(
      'categories.ejs',
      Object.assign(
        loggedInUserData,
        { results: result },
        { category: category },
        alertData
      )
    );
  });
});
//-------------------------------
//addabook page - get request - displays form to add a book
app.get('/addabook', function (req, res) {
  if (loggedInUserData.admin != 1) {
    alertData.alert = 'danger';
    const sqlSearch = 'Select * from books WHERE availability = 1';
    db.query(sqlSearch, (err, result) => {
      if (err) throw err;

      res.render(
        'index.ejs',
        Object.assign(loggedInUserData, { results: result }, alertData)
      );
    });
  } else {
    alertData.alert = '';
    myaccountdata = Object.assign(loggedInUserData, alertData);
    res.render('addabook.ejs', myaccountdata);
  }
});
//-------------------------------
// deleteabook page - get request - displays all books with possibility to delete any
app.get('/deleteabook', function (req, res) {
  if (loggedInUserData.admin != 1) {
    alertData.alert = 'danger';
    const sqlSearch = 'Select * from books WHERE availability = 1';
    db.query(sqlSearch, (err, result) => {
      if (err) throw err;

      res.render(
        'index.ejs',
        Object.assign(loggedInUserData, { results: result }, alertData)
      );
    });
  } else {
    const sqlSearch = 'Select * from books';
    db.query(sqlSearch, (err, result) => {
      if (err) throw err;
      res.render(
        'deleteabook.ejs',
        Object.assign(loggedInUserData, { results: result })
      );
    });
  }
});
//-------------------------------
// editabook page - get request - displays all books with possiblity to choose any to edit
app.get('/editabook', function (req, res) {
  if (loggedInUserData.admin != 1) {
    alertData.alert = 'danger';
    const sqlSearch = 'Select * from books WHERE availability = 1';
    db.query(sqlSearch, (err, result) => {
      if (err) throw err;

      res.render(
        'index.ejs',
        Object.assign(loggedInUserData, { results: result }, alertData)
      );
    });
  } else {
    const sqlSearch = 'Select * from books';
    db.query(sqlSearch, (err, result) => {
      if (err) throw err;
      res.render(
        'editabook.ejs',
        Object.assign(loggedInUserData, { results: result })
      );
    });
  }
});
//-------------------------------
//edit page - get request - displays form to edit specific book
app.get('/edit', function (req, res) {
  if (loggedInUserData.admin != 1) {
    alertData.alert = 'danger';
    const sqlSearch = 'Select * from books WHERE availability = 1';
    db.query(sqlSearch, (err, result) => {
      if (err) throw err;

      res.render(
        'index.ejs',
        Object.assign(loggedInUserData, { results: result }, alertData)
      );
    });
  } else {
    myaccountdata = Object.assign(loggedInUserData, alertData, bookedit);
    res.render('edit.ejs', myaccountdata);
  }
});
//-------------------------------
//edit page redirect - post request - redirects from list of all books to edit a specific one
app.post('/edit', function (req, res) {
  alertData.alert = '';
  //data of the book that is currently edited
  bookedit.author = req.body.author;
  bookedit.title = req.body.title;
  bookedit.isbn = req.body.isbn;
  bookedit.category = req.body.category;
  res.redirect('edit');
});
//-------------------------------
//edited - post request - responsible for book edition process
app.post('/edited', function (req, res) {
  const title = req.body.title;
  const author = req.body.author;
  const isbn = req.body.isbn;
  var category = req.body.category;
  if (category == '') {
    category = null;
  }

  const sqlUpdate =
    'UPDATE books SET title = ?, author = ?, isbn = ?, category = ? WHERE isbn = ?';
  const update_query = mysql.format(sqlUpdate, [
    title,
    author,
    isbn,
    category,
    bookedit.isbn,
  ]);

  db.query(update_query, (err, result) => {
    if (err) throw err;

    console.log(
      'Book: ' + bookedit.title + ', isbn: ' + bookedit.isbn + ' edited'
    );
    alertData.alert = 'success';
    bookedit.title = title;
    bookedit.author = author;
    bookedit.isbn = isbn;
    bookedit.category = category;
    res.redirect('edit');
  });
});
//-------------------------------
//bookreturned page - get request - displays form for admin to return a book
app.get('/bookreturned', function (req, res) {
  if (loggedInUserData.admin != 1) {
    alertData.alert = 'danger';
    const sqlSearch = 'Select * from books WHERE availability = 1';
    db.query(sqlSearch, (err, result) => {
      if (err) throw err;

      res.render(
        'index.ejs',
        Object.assign(loggedInUserData, { results: result }, alertData)
      );
    });
  } else {
    alertData.alert = '';
    myaccountdata = Object.assign(loggedInUserData, alertData);
    res.render('bookreturned.ejs', myaccountdata);
  }
});
//-------------------------------
//bookreturned - post request - responsible for returning a book
app.post('/bookreturned', function (req, res) {
  //if user is not logged in redirect to login page
  if (loggedInUserData.id == '') {
    alertData.alert = 'danger3';
    res.render('login.ejs', alertData);
  } else {
    var date = new Date(req.body.returndate).toISOString().split('T')[0];
    var isbn = req.body.isbn;
    var email = req.body.email;
    var userid;
    var bookid;
    const sqlEmailSearch = 'Select * from userss where email = ?';
    const searchEmail_query = mysql.format(sqlEmailSearch, [email]);
    const sqlBookSearch = 'Select * from books where isbn = ?';
    const searchBook_query = mysql.format(sqlBookSearch, [isbn]);

    const sqlResSearch =
      'Select * from reservations WHERE fkbooks = ? AND fkuserss = ?';

    const sqlUpdate = 'UPDATE books SET availability = 1 WHERE idbooks = ?';

    const sqlUpdateRes =
      'UPDATE reservations SET dateofreturn = ? WHERE fkbooks = ? AND fkuserss = ?';

    db.query(searchEmail_query, (err, result) => {
      if (err) throw err;
      if (result.length != 0) {
        userid = result[0].idusers;
        db.query(searchBook_query, (err, result) => {
          if (err) throw err;
          if (result.length != 0) {
            bookid = result[0].idbooks;
            const searchRes_query = mysql.format(sqlResSearch, [
              bookid,
              userid,
            ]);
            db.query(searchRes_query, (err, result) => {
              if (err) throw err;
              if (result.length != 0) {
                const update_query = mysql.format(sqlUpdate, [bookid]);
                db.query(update_query, (err, result) => {
                  if (err) throw err;
                  const update_queryRes = mysql.format(sqlUpdateRes, [
                    date,
                    bookid,
                    userid,
                  ]);
                  db.query(update_queryRes, (err, result) => {
                    if (err) throw err;
                    alertData.alert = 'success';
                    res.render(
                      'bookreturned.ejs',
                      Object.assign(
                        loggedInUserData,
                        { results: result },
                        alertData
                      )
                    );
                  });
                });
              } else {
                alertData.alert = 'danger3';
                res.render(
                  'bookreturned.ejs',
                  Object.assign(
                    loggedInUserData,
                    { results: result },
                    alertData
                  )
                );
              }
            });
          } else {
            alertData.alert = 'danger2';
            res.render(
              'bookreturned.ejs',
              Object.assign(loggedInUserData, { results: result }, alertData)
            );
          }
        });
      } else {
        alertData.alert = 'danger1';
        res.render(
          'bookreturned.ejs',
          Object.assign(loggedInUserData, { results: result }, alertData)
        );
      }
    });
  }
});
//-------------------------------
//login page - gert request - displays login page
app.get('/login', function (req, res) {
  alertData.alert = '';
  res.render('login.ejs', alertData);
});
//-------------------------------
//logout - get request - responsible for logging out
app.get('/logout', function (req, res) {
  loggedInUserData = { fname: '', lname: '', email: '', id: '', admin: '' };
  alertData.alert = 'success';
  res.render('login.ejs', alertData);
});
//-------------------------------
//register page - get request - displays register page
app.get('/register', function (req, res) {
  alertData.alert = '';
  res.render('register.ejs', alertData);
});
//-------------------------------
// history page - get request - displays history of reservations for specific user *NOT FINISHED*
app.get('/history', function (req, res) {
  const sqlSearch = 'Select * from reservations WHERE fkuserss = ?';
  const search_query = mysql.format(sqlSearch, [loggedInUserData.id]);
  const sqlSearch2 = 'Select * from books WHERE idbooks = ?';

  if (loggedInUserData.id != '') {
    db.query(search_query, (err, result) => {
      if (err) throw err;
      var books = new Array(result.length);
      var num = 0;
      for (var i = 0; i < result.length; i++) {
        const search_query2 = mysql.format(sqlSearch2, [result[i].fkbooks]);

        db.query(search_query2, (err, result2) => {
          if (err) throw err;

          books[num] = { title: result2[0].title, author: result2[0].author };
          console.log(books[num]);
          console.log(num);
          num++;
        });
      }
      // console.log(result[0] )
      // console.log("------------------")
      console.log(books[0]);
      //res.render( "history.ejs", Object.assign(loggedInUserData, { results: result }, alertData, { results2: books }));
    });
  } else {
    res.redirect('login');
  }
});
//-------------------------------
//post request - responsible for changing details for specific account
app.post('/changedetails', (req, res) => {
  if (loggedInUserData.email != '') {
    if (req.body.email != '') {
      const sqlUpdate = 'UPDATE userss SET email = ? WHERE email = ?';
      const update_query = mysql.format(sqlUpdate, [
        req.body.email,
        loggedInUserData.email,
      ]);
      db.query(update_query, (err, result) => {
        if (err) throw err;
        console.log('--------> Email changed');
      });

      loggedInUserData.email = req.body.email;
    }
    if (req.body.fname != '') {
      const sqlUpdate = 'UPDATE userss SET fname = ? WHERE email = ?';
      const update_query = mysql.format(sqlUpdate, [
        req.body.fname,
        loggedInUserData.email,
      ]);
      db.query(update_query, (err, result) => {
        if (err) throw err;
        console.log('--------> First name changed');
      });

      loggedInUserData.fname = req.body.fname;
    }
    if (req.body.lname != '') {
      const sqlUpdate = 'UPDATE userss SET lname = ? WHERE email = ?';
      const update_query = mysql.format(sqlUpdate, [
        req.body.lname,
        loggedInUserData.email,
      ]);
      db.query(update_query, (err, result) => {
        if (err) throw err;
        console.log('--------> Last name changed');
      });

      loggedInUserData.lname = req.body.lname;
    }
    console.log('details changed');
    alertData.alert = 'success2';
    myaccountdata = Object.assign(loggedInUserData, alertData);
    res.render('myaccount.ejs', myaccountdata);
  } else {
    console.log('user not logged in');
    res.render('login.ejs', alertData);
  }
});
//-------------------------------
//post request - responsible for changing password for specific user
app.post('/changepassword', async (req, res) => {
  const oldPassword = req.body.password;
  const newPassword = req.body.newpassword;
  const repeatPassword = req.body.renewpassword;
  const hashedNewPassword = await bcrypt.hash(req.body.renewpassword, 10);
  if (loggedInUserData.email != '') {
    if (newPassword == repeatPassword) {
      const sqlSearch = 'Select * from userss where email = ?';
      const search_query = mysql.format(sqlSearch, [loggedInUserData.email]);

      const sqlUpdate = 'UPDATE userss SET password = ? WHERE email = ?';
      const update_query = mysql.format(sqlUpdate, [
        hashedNewPassword,
        loggedInUserData.email,
      ]);

      db.query(search_query, async (err, result) => {
        if (err) throw err;
        console.log(result.length);
        const hashedPassword = result[0].password;
        //get the hashedPassword from result
        if (await bcrypt.compare(oldPassword, hashedPassword)) {
          db.query(update_query, (err, result) => {
            if (err) throw err;
            console.log('Password updated');
            alertData.alert = 'success';
            myaccountdata = Object.assign(loggedInUserData, alertData);
            res.render('myaccount.ejs', myaccountdata);
          });
        } else {
          console.log('Password incorrect');
          alertData.alert = 'danger1';
          myaccountdata = Object.assign(loggedInUserData, alertData);
          res.render('myaccount.ejs', myaccountdata);
        }
      });
    } else {
      console.log("password don't match");
      alertData.alert = 'danger2';
      myaccountdata = Object.assign(loggedInUserData, alertData);
      res.render('myaccount.ejs', myaccountdata);
    }
  } else {
    console.log('User not logged in');
    res.render('login', alertData);
  }
});
//-------------------------------
//addabook - post request - responsible for adding book process
app.post('/addabook', (req, res) => {
  const isbn = req.body.isbn;
  const title = req.body.title;
  const author = req.body.author;
  var category = req.body.category;
  if (category == '') {
    category = null;
  }

  const sqlSearch = 'SELECT * FROM books WHERE isbn = ?';
  const search_query = mysql.format(sqlSearch, [isbn]);
  const sqlInsert =
    'INSERT INTO books ( title, author, isbn, category) VALUES (?,?,?,?)';
  const insert_query = mysql.format(sqlInsert, [title, author, isbn, category]);

  db.query(search_query, (err, result) => {
    if (err) throw err;
    console.log(result.length);
    if (result.length != 0) {
      console.log('------> ISBN already exists');
      alertData.alert = 'danger';
      myaccountdata = Object.assign(loggedInUserData, alertData);
      res.render('addabook.ejs', myaccountdata);
    } else {
      db.query(insert_query, (err, result) => {
        if (err) throw err;
        console.log('--------> Book added');
        alertData.alert = 'success';
        console.log(result.insertId);
        myaccountdata = Object.assign(loggedInUserData, alertData);
        res.render('addabook.ejs', myaccountdata);
      });
    }
  });
});
//-------------------------------
//delete - post request - responsible for deleting a book
app.post('/delete', (req, res) => {
  const isbn = req.body.isbn;
  const title = req.body.title;

  const sqlDelete = 'DELETE FROM books WHERE isbn = ?';
  const delete_query = mysql.format(sqlDelete, [isbn]);

  db.query(delete_query, (err, result) => {
    if (err) throw err;

    console.log('Book: ' + title + ', isbn: ' + isbn + ' deleted');
    alertData.alert = 'success';
    myaccountdata = Object.assign(loggedInUserData, alertData);
    res.redirect('deleteabook');
  });
});
//-------------------------------
//registration - post request - responsible for registration process
app.post('/register', async (req, res) => {
  const firstname = req.body.fname;
  const lastname = req.body.lname;
  const email = req.body.email;
  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  const sqlSearch = 'SELECT * FROM userss WHERE email = ?';
  const search_query = mysql.format(sqlSearch, [email]);
  const sqlInsert =
    'INSERT INTO userss ( fname, lname, email, password) VALUES (?,?,?,?)';
  const insert_query = mysql.format(sqlInsert, [
    firstname,
    lastname,
    email,
    hashedPassword,
  ]);

  db.query(search_query, async (err, result) => {
    if (err) throw err;
    console.log(result.length);
    if (result.length != 0) {
      console.log('------> User already exists');
      alertData.alert = 'danger';
      res.render('register.ejs', alertData);
    } else {
      db.query(insert_query, (err, result) => {
        if (err) throw err;
        console.log('--------> Created new User');
        alertData.alert = 'success';
        console.log(result.insertId);
        res.render('register.ejs', alertData);
      });
    }
  });
});
//-------------------------------
//LOGIN (AUTHENTICATE USER) - post request - responsible for logging process
app.post('/login', async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const sqlSearch = 'Select * from userss where email = ?';
  const search_query = mysql.format(sqlSearch, [email]);

  db.query(search_query, async (err, result) => {
    if (err) throw err;
    if (result.length == 0) {
      console.log('--------> User does not exist');
      alertData.alert = 'danger1';
      res.render('login', alertData);
    } else {
      const hashedPassword = result[0].password;
      //get the hashedPassword from result
      if (await bcrypt.compare(password, hashedPassword)) {
        console.log('---------> Login Successful');
        loggedInUserData.fname = result[0].fname;
        loggedInUserData.lname = result[0].lname;
        loggedInUserData.email = result[0].email;
        loggedInUserData.id = result[0].idusers;
        loggedInUserData.admin = result[0].admin;
        res.redirect('/');
      } else {
        console.log('---------> Password Incorrect');
        alertData.alert = 'danger2';
        res.render('login', alertData);
      }
    }
  });
});
//-------------------------------
// listening on port 8000
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
//-------------------------------
