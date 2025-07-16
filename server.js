/********************************************************************************
*  WEB322 – Assignment 04
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Priscilla Lacerda Student ID: 159881234 Date: Jul, 20 2025
*  Published URL: https://github.com/placerdacb/Assignment4.git
*
********************************************************************************/

const { title } = require("process");
const projectData = require("./modules/projects");
const sectorData = require('./public/data/sectorData.json');
const express = require('express'); // "require" the Express module
const path = require('path'); // "require" the path module to help with file paths
require('pg'); // explicitly require the "pg" module
const { error } = require("console"); // create an instance of the Express application
const app = express(); // obtain the "app" object
app.use(express.urlencoded({ extended: true })); // parse URL-encoded bodies (as sent by HTML forms)
app.use(express.json()); // parse JSON bodies (as sent by API clients)
const sequelize = require("./modules/projects").sequelize; // import the sequelize instance from projects.js

app.set('view engine', 'ejs'); // Set the view engine to EJS
app.set('views', __dirname + '/views'); // Set the views directory to the "views" folder in the current directory
app.use(express.static('public')); // Serve static files from the "public" directory

const HTTP_PORT = process.env.PORT || 8080; // assign a port

// Test the database connection
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((err) => {
    console.log('Unable to connect to the database:', err);
  });

// First invoke the projectData.initialize() function and make sure it has completed 
// successfully (ie "resolves") before we execute our app.listen()
projectData.Initialize()
    .then(() => {
        console.log(`Initialize() completed successfully`);
        // start the server on the port and output a confirmation to the console
        app.listen(HTTP_PORT, () => console.log(`server listening on: ${HTTP_PORT}`));
    })
    .catch(err => {
        console.error("unable to invoke Initialize()", err);
    });

//GET "/"
app.get("/", (req, res) => {
    // Render the "home" page, rendered using the "home.ejs" template
    res.render("home");
});

//GET "/about"
app.get("/about", (req, res) => {
    // Render the "about" page, rendered using the "about.ejs" template
    res.render("about");
});

// Create a map of sector IDs to sector names for easy lookup
// This will be used to replace sector IDs with sector names in the project data
const sectorMap = sectorData.reduce((map, sector) => {
  map[sector.id] = sector.sector_name;
  return map;
}, {});


// GET "/solutions/projects"
app.get('/solutions/projects', (req, res) => {
    // return all projects if no sector is specified,
    const sector = req.query.sector;

    // otherwise return projects for the specified sector
    if (sector) {
        // invoking the function with a known sector value from the projectData file.
        // If the sector is not found, the promise will be rejected and the catch block will handle it.
        projectData.getProjectsBySector(sector)
            .then(projects => { projects.forEach(p => { 
                p.sector = sectorMap[p.sector_id];
            });
        
            res.render("projects", { projects });
        })
            .catch(err => res.status(404).render("404", {message: `No projects found for sector "${sector}"`}));
    } else {
        // If no sector is specified, return all projects.
        projectData.getAllProjects()
            .then(projects => { projects.forEach(p => {
                p.sector = sectorMap[p.sector_id];
        });

        res.render("projects", { projects });
    })      
      .catch(err => res.status(404).render("404", {message: `I'm sorry, no projects found for sector "${sector}"`}));
    }
});

// Route to add a new project
app.get('/solutions/addProject', (req, res) => {
    projectData.getAllSectors()
        .then((sectors) => {
            res.render("addProject", { sectors });
        })
        .catch((err) => {
            res.render("500", { message: "Unable to load sectors." });
        });
});

// Route to handle adding a new project
app.post('/solutions/addProject', (req, res) => {
    console.log('POST /solutions/addProject - req.body:', req.body);
    projectData.addProject(req.body)
        .then(() => {
            res.redirect('/solutions/projects');
        })
        .catch((err) => {
            res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
        }
    );
});

// GET route to render the edit project form for a specific project 
app.get('/solutions/editProject/:id', (req, res) => {
    const projectId = req.params.id;

    Promise.all([
        projectData.getProjectById(projectId),
        projectData.getAllSectors()
    ])
    .then(([project, sectors]) => {
        res.render("editProject", { project, sectors });
    })
    .catch((err) => {
        res.status(404).render("404", { message: err });
    });
});

// POST route to handle editing a project
app.post("/solutions/editProject", (req, res) => {
    console.log('POST /solutions/editProject - req.body:', req.body);
  const id = req.body.id;
  const projectDataUpdate = req.body;

  projectData.editProject(id, projectDataUpdate)
    .then(() => {
      res.redirect("/solutions/projects");
    })
    .catch((err) => {
      res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
    });
});

// GET route to render the edit project form for a specific project 
app.get('/solutions/deleteProject/:id', (req, res) => {
    projectData.deleteProject(req.params.id)
    .then(() => {
        res.redirect("/solutions/projects");
    })
    .catch((err) => {
        res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
    });
});

// Route for serving the projects HTML page
app.get('/projects', (req, res) => {
  projectData.getAllProjects()
    .then(projects => res.render("projects", { projects, page: "/solutions/projects" }))
    .catch(err => res.status(500).send("Error loading projects."));
});

//GET "/solutions/projects/:id"
app.get("/solutions/projects/:id", (req, res) => {
  const projectID = req.params.id;
  projectData.getProjectById(projectID)
    .then((project) => {
      res.render("project", { project, page: "/solutions/projects" });
    })
    .catch(err => {
      res.status(404).render("404", {message: `I'm sorry, no project found with the "${projectID}" ID`});
    });
});

// Catch-all 404 route
app.use((req, res) => {
    res.status(404).render("404", {message: "I'm sorry, we're unable to find what you're looking for"});
});