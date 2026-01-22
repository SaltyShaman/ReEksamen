## Re-eksamen node js valgfag

## Projekt: Biograf med en række film, lokaler og sæder

TO-DO: 
        halls socket console log fix

        seat entity

        movie entity

        reservation

        showtimes

        authentication for frontend roles for USER entity (as project is being built)

        user dashboard with reservations. full details with movie reservations



        admin dashboard with more options:
                movie dashboard. CRUD <---a movie attached to showtime>

                hall delete update:
                        --> you cannot delete a hall if there is a showtime booked

                seat dashboard and overview. CRUD
                        -> see if admin can mark a seat as unavaible

                reservations CRUD
                        --> optionial: staticstics over reservations by movie

                
                showtime CRUD


        

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