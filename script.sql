DROP TABLE IF EXISTS weather;


CREATE TABLE weather (   
   city  varchar(50) not null,
   temp_lo double precision not null,
   "limit" double precision not null,
   "date"  date
);

INSERT INTO public.weather VALUES('Helsinki', -5.2, 7.6, '01/23/2021');
INSERT INTO public.weather VALUES('Stockholm', 0.2, 7.2, '01/23/2021');
INSERT INTO public.weather VALUES('Chicago', 15.8, 32.1, '01/23/2021');
INSERT INTO public.weather VALUES('Wroclaw',  -1.2, 5.8, '01/23/2021');
INSERT INTO public.weather VALUES('Berlin', 7.3, 14.9, '01/23/2021');
