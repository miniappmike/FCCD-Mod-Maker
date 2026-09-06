These are HARD Limitations set by the game's developer. The custom .JSON file should adhere by this and show an error when limitations aren't met
Below are the limitations
Custom league universe requirements:
Must be a JSON file
Requires 'name', 'startingYear', 'startingMessage', 'conferences', and 'bowlGames' at the top level
Bowl games each have 'name' and 'zipcode' (where they are played), should be ordered by importance
Must have exactly 6, 8, or 10 conferences, each with a different prestige level (required for realignment)
Each conference has 'name', 'prestigeLevel' (1 - 10), 'zipcode' (where CCG is played), and 'divisions'
Each conference must have one of these formats:
Single division of 10 teams
2 divisions, each with 6 or 7 or 9 teams
4 divisions, each with 4 or 5 teams
Each division has 'name' and 'teams'
Each team has 'name', 'mascot', 'abbreviation', 'rivalAbbreviation', 'primaryColor', 'secondaryColor', 'zipcode', and 'attributes'
Abbreviations must be unique, and rivalAbbreviation must be in the division as well
Team attributes include 'prestige', 'facilities', 'stadium', 'collegeLife', 'academics', 'marketing', 'fanbaseLevel', and 'attendance'
All except attendance are on a 1 - 10 scale, attendance is just number of students (i.e. 45000)
