DROP TABLE IF EXISTS weather;

CREATE TABLE weather (
   id SERIAL primary key not null,
   city  varchar(50) not null,
   country varchar(50) not null,
   temp_lo   double precision not null,
   temp_hi  double precision not null,
   "date"  date
);

ALTER TABLE ONLY weather ALTER COLUMN id SET DEFAULT nextval('id_seq'::regclass);

INSERT INTO public.weather VALUES(1,'Helsinki', 'Finland', -5.2, 7.6, '01/23/2021');
INSERT INTO public.weather VALUES(2,'Stockholm', 'Sweden', 0.2, 7.2, '01/23/2021');
INSERT INTO public.weather VALUES(3,'Chicago', 'USA', 15.8, 32.1, '01/23/2021');
INSERT INTO public.weather VALUES(4,'Wroclaw', 'Poland', -1.2, 5.8, '01/23/2021');
INSERT INTO public.weather VALUES(5,'Berlin', 'Germany', 7.3, 14.9, '01/23/2021');
