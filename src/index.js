import readlineSync from "readline-sync";
import { generateFlightId, isValidDateString, logSeparated, logWrapped, wrapString } from "./utilities.js";
import { createFlightEntry, printScheduleTable } from "./flightScheduleDisplay.js";

const lineLength = 94;
const mainMenuOptions = ["View current flight schedule", "Log flight change", "EXIT"];
const scheduleChangeMenuOptions = ["Change existing flight date", "Add new flight"];

let airlines = ["Qantas", "Jetstar", "Virgin"];
let flights = [
    { id: "QA187", airline: "Qantas", origin: "Sydney", destination: "Perth", date: "15/05/2024" },
    { id: "JE095", airline: "Jetstar", origin: "Gold Coast", destination: "Alice Springs", date: "07/06/2024" },
    { id: "VI783", airline: "Virgin", origin: "Bangkok", destination: "London", date: "16/08/2024" },
];

let input = "";

// MAIN LOOP
do {
    console.clear();
    logSeparated("MENU", lineLength);
    input = readlineSync.keyInSelect(mainMenuOptions, "Please select an action to continue", { cancel: false });

    switch (input) {
        case 0: { 
            // VIEW SCHEDULE
            console.clear();
            logSeparated("Current Schedule", lineLength);
            printScheduleTable(flights);
            readlineSync.keyInPause(wrapString("Press q to return to main menu..."), { limit: ["q"], guide: false });
            break;
        }

        case 1: {
            // UPDATE SCHEDULE
            console.clear();
            logSeparated("Update Schedule", lineLength);
            const choice = readlineSync.keyInSelect(scheduleChangeMenuOptions, "Please select an action to continue", { cancel: false });

            switch (choice) {
                case 0: {
                    // CHANGE EXISTING FLIGHT DATE
                    console.clear();
                    logSeparated("Change Flight Date", lineLength);

                    let flightIndex = -1;
                    let flightId = "";

                    do {
                        flightId = readlineSync.question(wrapString("Enter the id of the flight to change the date for: "));
                        flightIndex = flights.findIndex(f => f.id.toLowerCase() === flightId.toLowerCase());

                        if (flightIndex < 0) {
                            logWrapped(`ERROR: Flight ID ${flightId} not found. Please enter an ID from the current schedule.`);
                        }
                    } while (flightIndex < 0);

                    logWrapped(`The current departure date for ${flights[flightIndex].id} is ${flights[flightIndex].date}`);

                    const newDate = enterFlightDate();
                    flights[flightIndex].date = newDate;

                    logWrapped("Flight successfully updated!");
                    readlineSync.keyInPause(wrapString("Press q to return to main menu..."), { limit: ["q"], guide: false });
                    break;
                }

                case 1: {
                    // ADD NEW FLIGHT
                    console.clear();
                    logSeparated("Add New Flight", lineLength);

                    let airlineIndex = 0;
                    let previousLength = 0;

                    do {
                        airlineIndex = readlineSync.keyInSelect(
                            [...airlines, "Add New Airline"],
                            "Select an existing airline or add a new one",
                            { cancel: false }
                        );

                        previousLength = airlines.length;

                        if (airlineIndex === airlines.length) {
                            let added = false;
                            do {
                                const name = readlineSync.question(wrapString("Enter the name of the airline to add: "));
                                const updated = addAirline(name, airlines);
                                added = updated.length !== airlines.length;
                                airlines = updated;
                            } while (!added);
                        }
                    } while (airlineIndex === previousLength);

                    const origin = readlineSync.question(wrapString("Enter the departure location: "));
                    const destination = readlineSync.question(wrapString("Enter the destination: "));
                    const date = enterFlightDate();

                    const flight = {
                        id: generateFlightId(airlines[airlineIndex]),
                        airline: airlines[airlineIndex],
                        origin,
                        destination,
                        date
                    };

                    flights.push(flight);

                    logWrapped(`Successfully added flight ${flight.id} with the following details:`);
                    console.log(createFlightEntry(flight));
                    readlineSync.keyInPause(wrapString("Press q to return to main menu..."), { limit: ["q"], guide: false });
                    break;
                }

                case 2:
                    break;
            }
            break;
        }

        case 2:
            break;
    }
} while (input !== 2);

console.clear();
logWrapped("EXITING...", lineLength);

// ----------------------
// HELPER FUNCTIONS
// ----------------------

function enterFlightDate() {
    let date = "";
    let valid = false;

    do {
        date = readlineSync.question(wrapString("Enter the departure date (DD/MM/YYYY): "));
        valid = isValidDateString(date);

        if (!valid) {
            logWrapped("ERROR: Invalid date format or non-existent date. Please try again.");
        }
    } while (!valid);

    return date;
}

/**
 * Adds an airline if valid and not already present.
 */
function addAirline(airline, airlines) {
    const trimmed = airline.trim();

    if (trimmed === "") {
        logWrapped("ERROR: Airline name cannot be blank.");
        return airlines;
    }

    const exists = airlines.some(a => a.toLowerCase() === trimmed.toLowerCase());

    if (exists) {
        logWrapped("ERROR: Airline already exists.");
        return airlines;
    }

    airlines.push(trimmed);
    logWrapped(`Airline ${trimmed} successfully added.`);
    return airlines;
}