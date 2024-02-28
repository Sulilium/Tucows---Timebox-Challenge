-- This file is used to run repetitive actions
-- Can optimize creation and insertion by using functions

-- @block
-- Creates the daily, monthly, and yearly tables:
CREATE TABLE Daily(
    dated DATE,
    country VARCHAR(256) NOT NULL,
    rate DECIMAL(10,4)
);
CREATE TABLE Monthly(
    dated DATE,
    country VARCHAR(256) NOT NULL,
    rate DECIMAL(10,4)
);
CREATE TABLE Yearly(
    dated DATE,
    country VARCHAR(256) NOT NULL,
    rate DECIMAL(10,4)
);

-- @block
-- Creates the csv files into tables, countries are put in as lower case:
LOAD DATA INFILE 'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/data/daily_csv.csv' 
INTO TABLE Daily 
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\r\n'
IGNORE 1 ROWS
(dated, @country, @rate)
SET rate = NULLIF(@rate, ''), country = LOWER(@country);

LOAD DATA INFILE 'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/data/monthly_csv.csv' 
INTO TABLE Monthly 
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\r\n'
IGNORE 1 ROWS
(dated, @country, @rate)
SET rate = NULLIF(@rate, ''), country = LOWER(@country);

LOAD DATA INFILE 'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/data/yearly_csv.csv' 
INTO TABLE Yearly 
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\r\n'
IGNORE 1 ROWS
(dated, @country, @rate)
SET rate = NULLIF(@rate, ''), country = LOWER(@country);

-- @block
-- Drops all tables:
DROP TABLE Daily;
DROP TABLE Monthly;
DROP TABLE Yearly;
