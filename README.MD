## Re-eksamen node js valgfag

## Projekt: Biograf med en række film, lokaler og sæder

TO-DO: 
        

        movie entity


        authentication for frontend roles for USER entity (as project is being built)

        user dashboard with reservations by movie. full details with movie reservations



        admin dashboard with more options:
                movie dashboard. CRUD <---a movie attached to hall>
                hall dashboard. CRUD <---seat attached to each hall>
                seat dashboard and overview



        

        dashboard for admin and user (diffrentiated views) admin done for user entity


basic ER diagrams:


user->seats -> hall <- movie

admin -> user

admin -> seats 

admin -> hall

admin -> movie

seats -> hall

movie -> hall


KNOWN BUGS:
admin list delte -> if you log in as admin and delete your own user you are not visable on the list until refresh
Create hall: If the seat amount is too big it will take a while to create the hall without showing proper feedback