// To automatically read both files and generate two arrays of objects: 
// "projectData" and "sectorData". 
const projectData = require("../public/data/projectData");
const sectorData = require("../public/data/sectorData");

// variable "projects" initialized as an empty array
// This will be the completed array of "project" objects, 
// after processing the above "projectData" and "sectorData" arrays.
let projects = [];

function Initialize() {
    return new Promise((resolve, reject) => {

        try {
            projectData.forEach(project => {
                let matchingSector = sectorData.find(sector => sector.id === project.sector_id);

                let newProject = {
                    ...project,
                    sector: matchingSector.sector_name
                };

                projects.push(newProject);
            });

            resolve('Initialize() resolved');

        } catch (error) {
            reject('unable to Initialize()');
        }
    });
}

// This function simply returns the complete "projects" array
function getAllProjects() {
    return new Promise((resolve, reject) => {
        //if project has content
        if (projects.length > 0) {
            // resolve with the completed "projects" array
            resolve(projects);
        } else {
            // show a error otherwise
            reject('the projects array is empty');
        }
    });
}

// This function will return a specific "project" object from the "projects" array, 
// whose "id" value matches the value of the "projectId" parameter
function getProjectById(projectId) {
    return new Promise((resolve, reject) => {

        let projectByID = projects.find(project => Number(projectId) === Number(project.id));

        // resolve with the found "project" object
        if (projectByID) {
            resolve(projectByID);
        } else {
            // reject with an appropriate message if the project was not found
            reject('getProjectById(): unable to find requested project');
        }
    });
}

//The purpose of this function is to return an array of objects from the "projects" 
// array whose "sector" value matches the "sector" parameter.  However, it is important 
// to note that the "sector" parameter may contain only part of the "sector" string, and case is ignored.
function getProjectsBySector(sector) {
    return new Promise((resolve, reject) => {

        let projectBySector = projects.filter(project =>
            //project.sector.toUpperCase().includes(sector.toUpperCase()));
            project.sector.toUpperCase() === sector.toUpperCase());

        if (projectBySector.length > 0) {
            resolve(projectBySector);
        } else {
            reject('getProjectBySector(): unable to find requested project');
        }
    });
}

module.exports = { Initialize, getAllProjects, getProjectById, getProjectsBySector };