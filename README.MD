## Re-eksamen node js valgfag

## Projekt: Biograf med en række film, lokaler og sæder

TO-DO: 

        reservation - FULL CRUD and LOGIN
                * create
                --> make so you can book multiple reservations as a group with same user

                * cancel reservation
                * see own reservations
                * update reservation (self)
                * admin delete


        
                see active reservations at dashboard with navigation to CRUD pages

        NICE TO HAVE: see past reservations


        movie entity (CRUD):

                FUTURE: movies by showtime

                nice to have: search by description

        halls: you cannot delete halls with active showtimes



        admin dashboard with more options:


        

        dashboard for admin and user (diffrentiated views)
                user
                halls (update delete to include logic about showtimes)
                seats: mark seats as unavaible per hall
                movies page


basic ER diagrams:


user->seats -> hall <- movie

admin -> user

admin -> seats 

admin -> hall

admin -> movie

seats -> hall

movie -> showtime

reservation -> showtime

seats -> reservations <- user

KNOWN BUGS:
admin list delte -> if you log in as admin and delete your own user you are not visable on the list until refresh
Create hall: If the seat amount is too big it will take a while to create the hall without showing proper feedback