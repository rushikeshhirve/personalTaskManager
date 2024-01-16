const express = require("express");
const bodyParser = require("body-parser");
const pg = require("pg");
const bcrypt = require("bcryptjs")
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = 3000;
const saltRounds = 10;

const { Pool } = pg;
const db = new Pool({
  connectionString: process.env.POSTGRES_URL + "?sslmode=require",
})
db.connect();

let currentUser;
let currentplan = "week";

app.use(bodyParser.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.set('views', __dirname + '/views')

app.use(express.static(__dirname + "/public"));

// app.use((req, res, next) => {
//   req.db = db;
//   next();
// });

// app.use((req, res, next) => {
//   res.header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
//   next();
// });

async function getItems(plan, user_id) {
  let result = await db.query(`SELECT * FROM ${plan} where user_id=${user_id} ORDER BY id`);
  return result.rows;
}

async function addItems(title, currentplan, date) {
  try {
    await db.query(`INSERT INTO ${currentplan} (title, date, user_id) VALUES ($1, $2, $3)`, [title, date, currentUser[0].id]);
  } catch (err) {
    console.error("Error: " + err.message);
    throw err; // Re-throw the error so that the calling function can handle it
  }
}

function getdate() {
  let currentDate = new Date();
  let formattedDate = currentDate.toLocaleDateString();
  let formattedTime = currentDate.toLocaleTimeString();
  return `${formattedTime} ${formattedDate}`
}

async function RegisterUser(name, email, password) {
  let result = await db.query("insert into users (name, email, password) values ($1, $2, $3)", [name, email, password]);
  return result;
}

app.get("/", (req, res) => {
  res.render("home.ejs")
})
app.get("/login", (req, res) => {
  res.render("login.ejs")
})
app.get("/register", (req, res) => {
  res.render("register.ejs")
})

app.get("/logout", (req, res) => {
  res.render("login", {msg: "You have log out seccessfully"});
});

app.post("/register", async (req, res) => {
  let { name, email, password, password2 } = req.body;
  let errors = [];

  if (password !== password2) {
    errors.push({ message: "Passwords do not match" });
  }
  if (errors.length > 0) {
    res.render("register", { errors });
  } else {
    const result = await db.query(`select * from users where email = $1;`, [email])
    if (result.rows.length > 0) {
      errors.push({ message: "email is already registed" });
      res.render("register", { errors });
    } else {
      //validation is successful here...Store hash in your password DB.
      await bcrypt.hash(password, saltRounds, async function (err, hash) {
        if (err) {
          throw err;
        } else {
          await RegisterUser(name, email, hash);
          res.render("login", { msg: "You are successfully registed to the application. Log in now." });
        }
      });
    }
  }
})

app.post("/login/userdashboard", async (req, res) => {
  let email = req.body.email
  let password = req.body.password
  db.query(`SELECT * FROM users WHERE email = $1`, [email], (err, results) => {
    if (err) {
      throw err;
    }

    if (results.rows.length > 0) {
      const user = results.rows[0];
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          console.log(err);
        }
        if (isMatch) {
          currentUser = results.rows
          console.log(currentUser)
          res.redirect("/login/userdashboard")
        } else {
          //password is incorrect
          res.render("login", { msg: "Password is wrong" });
        }
      });
    } else {
      // No user
      res.render("login", { msg: "No user with this username. Kindly register" });
    }
  }
  );
});

// ---------------------------------------
app.get("/login/userdashboard", async (req, res) => {
  await res.render("index.ejs", {
    newtitle: "today",
    plan: currentplan,
    listItems: await getItems(currentplan, currentUser && currentUser[0] ? currentUser[0].id : null),
    user: await currentUser
  });
});

app.post("/login/userdashboard/add", async (req, res) => {
  const item = req.body.newtitle;
  try {
    await addItems(item, currentplan, getdate());
    res.redirect("/login/userdashboard/");
  } catch (err) {
    // Handle the error, e.g., render an error page
    res.status(500).send("Internal Server Error");
  }
});

app.post("/login/userdashboard/edit", async (req, res) => {
  let { updatedItemId, updatedItemTitle, updatedState } = req.body
  // console.log(updatedItemId, updatedItemTitle, updatedState)
  await db.query(
    `UPDATE ${currentplan} SET title = $1, state=$2, date=$3 WHERE id = $4;`,
    [updatedItemTitle, updatedState, getdate() ,updatedItemId],
    (err, result) => {
      if (err) throw err;
      else {
        res.redirect("/login/userdashboard/");
      }
    }
  )
});

app.get("/login/userdashboard/plan",async (req, res) => {
  let {plan} = req.query;
  switch (plan) {
    case "1":
      currentplan = "week"
      break;
    case "2":
      currentplan = "month"
      break;
    case "3":
      currentplan = "year"
      break;
  }
  res.redirect("/login/userdashboard/");
})

app.post("/login/userdashboard/delete", async (req, res) => {
  let { deleteItemId } = req.body;
  try {
    await db.query(`DELETE FROM ${currentplan} WHERE id=$1`, [deleteItemId]);
    res.redirect("/login/userdashboard/");
  } catch (err) {
    // Handle the error, e.g., render an error page
    res.status(500).send("Internal Server Error");
  }
});


app.listen(port, () => {
  console.log(`Server is running on ${port}...`)
})

// process.on('SIGINT', () => {
//   db.$pool.end();
//   console.log('Database pool closed.');
//   process.exit(0);
// });