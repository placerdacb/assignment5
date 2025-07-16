require('dotenv').config(); // dotenv module 
// To automatically read both files and generate two arrays of objects: 
// "projectData" and "sectorData". 
require('pg');
const Sequelize  = require('sequelize');

// set up sequelize to point to our postgres database
let sequelize = new Sequelize(
    process.env.PGDATABASE,
    process.env.PGUSER,
    process.env.PGPASSWORD,
    {
        host: process.env.PGHOST,
        dialect: 'postgres',
        port: 5432,
        dialectOptions: {
        ssl: { rejectUnauthorized: false },
        },
    }
);

// Define the Project model
const Project = sequelize.define(
  'Project',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true, // use "project_id" as a primary key
      autoIncrement: true, // automatically increment the value
    },
    title: Sequelize.STRING, // entry title
    feature_img_url: Sequelize.STRING, // entry feature image URL
    summary_short: Sequelize.TEXT, // entry summary short
    intro_short: Sequelize.TEXT, // entry intro short
    impact: Sequelize.TEXT, // entry impact
    original_source_url: Sequelize.STRING, // entry original source URL
    sector_id: {
      type: Sequelize.INTEGER,
      references: {
        model: 'Sectors', // name of the target table
        key: 'id', // key in the target table that we're referencing
      },
    }, // foreign key to the "Sectors" table
  },
  {
    createdAt: false, // disable createdAt
    updatedAt: false, // disable updatedAt
  }
);

const Sector = sequelize.define('Sector', {
    id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
    }, // primary key
    sector_name: Sequelize.STRING, // entry description
});

Project.belongsTo(Sector, { foreignKey: 'sector_id' });

// variable "projects" initialized as an empty array
// This will be the completed array of "project" objects, 
// after processing the above "projectData" and "sectorData" arrays.

function Initialize() {
    return new Promise((resolve, reject) => {

        sequelize.sync() // synchronize the database with our models
        .then(() => {
            resolve('Initialize() resolved');
        })
        .catch((error) => {
            reject('unable to Initialize()');
        });
    });
}

// This function simply returns the complete "projects" array
function getAllProjects() {
    return new Promise((resolve, reject) => {
        sequelize.sync()
        .then(() => {
            return Project.findAll({
                order: [['id', 'ASC']], // order by project ID in ascending order
                include: [Sector], // include the Sector model to get sector names
            });
        })
        .then(projects => {
            if (projects.length > 0) { 
                resolve(projects); // returns the complete array of projects
            } else {
                reject('Unable to retrieve projects');
            }
        })
        .catch(err => {
            // reject with an appropriate message if there was an error
            reject('getAllProjects(): unable to retrieve projects');
        });
    });
}

// This function will return a specific "project" object from the "projects" array, 
// whose "id" value matches the value of the "projectId" parameter
function getProjectById(projectId) {
  return new Promise((resolve, reject) => {
    Project.findAll({
      where: { id: projectId },
      order: [['id', 'ASC']], // order by project ID in ascending order
      include: [Sector]
    })
      .then((projects) => {
        
        if (projects.length > 0) {
          resolve(projects[0]); // returns the first project found
        } else {
          reject("Unable to find requested project");
        }
      })
      .catch((err) => {
        reject("getProjectById(): unable to find requested project");
      });
  });
}

//The purpose of this function is to return an array of objects from the "projects" 
// array whose "sector" value matches the "sector" parameter.  However, it is important 
// to note that the "sector" parameter may contain only part of the "sector" string, and case is ignored.
function getProjectsBySector(sector) {
    return new Promise((resolve, reject) => {

        Project.findAll({
            order: [['id', 'ASC']], // order by project ID in ascending order
            include: [Sector], 
            where: {  '$Sector.sector_name$': {
                [Sequelize.Op.iLike]: `%${sector}%`
            }}
        })
        .then(projects => {
            if (projects.length > 0) {
                resolve(projects); // returns the array of projects matching the sector
            } else {
                reject('Unable to find requested sector');
            }   
        })
        .catch(err => {
            reject('getProjectsBySector(): unable to find requested sector');
        });
    });
}

function addProject(projectData) {
    return new Promise((resolve, reject) => {
        Project.create(projectData)
            .then(() => {
                resolve(); // resolve the promise if the project is added successfully, without any data
            })
            .catch(err => {
                reject(err.errors[0].message); // reject with the error message from the first error
            });
    });
}

function getAllSectors() {
    return new Promise((resolve, reject) => {
        Sector.findAll( {
            order: [['id', 'ASC']] // order by sector ID in ascending order
        })
        .then(sectors => {      
            resolve(sectors); // returns sectors array even if it is empty
        })
            
        .catch(err => {
          reject('getAllSectors(): unable to retrieve sectors');
        });
    });
}

function editProject(id, projectData) {
    return new Promise((resolve, reject) => {
        Project.update(projectData, {
            where: { id: id }
        })
          
        .then(() => {
            resolve(); // resolve the promise if the project is updated successfully
        })
        .catch((err) => {
            reject(err.errors[0].message); // reject with the error message from the first error
        });
    });
}

function deleteProject(id) {
    return new Promise((resolve, reject) => {
        Project.destroy({
            where: { id: id }
        })
        .then(() => {    
          resolve(); // resolve the promise if the project is delete successfully, without any data
        })
            
        .catch(err => {
          reject(err.errors[0].message); // reject with the error message from the first error
        });
    });
}



module.exports = { Initialize, getAllProjects, getProjectById, getProjectsBySector, sequelize, addProject, getAllSectors, editProject, deleteProject };