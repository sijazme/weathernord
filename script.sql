DROP TABLE IF EXISTS weather;


CREATE TABLE weather (   
   city  varchar(50) not null,
   temp_lo double precision not null,
   "limit" double precision not null,
   "date"  timestamp
);
