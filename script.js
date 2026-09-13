/* =========================================================
   ELEMO HACKATHON
   JAVASCRIPT
   SUPABASE CONNECTED VERSION
   ========================================================= */


/* =========================================================
   SUPABASE
   ========================================================= */

const SUPABASE_URL =
    "https://ikpdluumapwokhxbgkra.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_QGFjYntTqifo-3hgYqFOjQ_9BZg4HgX";

const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* =========================================================
   MODAL
   ========================================================= */

const modal =
    document.getElementById("registrationModal");


function openModal() {

    if (!modal) {
        return;
    }

    modal.classList.add("active");

    document.body.style.overflow =
        "hidden";
}


function closeModal() {

    if (!modal) {
        return;
    }

    modal.classList.remove("active");

    document.body.style.overflow =
        "";
}


/* =========================================================
   CLOSE MODAL BY CLICKING OUTSIDE
   ========================================================= */

if (modal) {

    modal.addEventListener(
        "click",
        function (event) {

            if (
                event.target === modal
            ) {

                closeModal();

            }

        }
    );

}


/* =========================================================
   CLOSE MODAL WITH ESCAPE
   ========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape"
        ) {

            closeModal();

        }

    }
);


/* =========================================================
   PAYMENT SCREENSHOT
   ========================================================= */

const paymentScreenshot =
    document.getElementById(
        "paymentScreenshot"
    );


const fileName =
    document.getElementById(
        "fileName"
    );


if (
    paymentScreenshot &&
    fileName
) {

    paymentScreenshot.addEventListener(
        "change",
        function () {

            if (
                this.files &&
                this.files.length > 0
            ) {

                fileName.textContent =
                    this.files[0].name;

            } else {

                fileName.textContent =
                    "PNG / JPG / WEBP";

            }

        }
    );

}


/* =========================================================
   SCROLL REVEAL
   ========================================================= */

const revealElements =
    document.querySelectorAll(
        ".reveal"
    );


if (
    "IntersectionObserver"
    in window
) {

    const observer =
        new IntersectionObserver(
            function (entries) {

                entries.forEach(
                    function (entry) {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.classList.add(
                                "visible"
                            );

                            observer.unobserve(
                                entry.target
                            );

                        }

                    }
                );

            },
            {
                threshold: 0.12
            }
        );


    revealElements.forEach(
        function (element) {

            observer.observe(
                element
            );

        }
    );

} else {

    revealElements.forEach(
        function (element) {

            element.classList.add(
                "visible"
            );

        }
    );

}


/* =========================================================
   REGISTRATION FORM
   ========================================================= */

const registrationForm =
    document.getElementById(
        "registrationForm"
    );


if (registrationForm) {

    registrationForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            /* =================================================
               CHECK PAYMENT SCREENSHOT
               ================================================= */

            if (
                !paymentScreenshot ||
                !paymentScreenshot.files.length
            ) {

                alert(
                    "Please upload your payment screenshot."
                );

                return;
            }


            const file =
                paymentScreenshot.files[0];


            /* =================================================
               ALLOWED FILE TYPES
               ================================================= */

            const allowedTypes = [

                "image/png",

                "image/jpeg",

                "image/webp"

            ];


            if (
                !allowedTypes.includes(
                    file.type
                )
            ) {

                alert(
                    "Please upload a PNG, JPG or WEBP image."
                );

                return;
            }


            /* =================================================
               MAXIMUM FILE SIZE
               ================================================= */

            const maxSize =
                10 * 1024 * 1024;


            if (
                file.size > maxSize
            ) {

                alert(
                    "Your payment screenshot must be smaller than 10 MB."
                );

                return;
            }


            /* =================================================
               GET FORM VALUES
               ================================================= */

            const leaderName =
                document.getElementById(
                    "leaderName"
                )?.value.trim();


            const teammate1Name =
                document.getElementById(
                    "teammate1Name"
                )?.value.trim();


            const teammate2Name =
                document.getElementById(
                    "teammate2Name"
                )?.value.trim();


            const email =
                document.getElementById(
                    "email"
                )?.value.trim();


            const year =
                document.getElementById(
                    "year"
                )?.value.trim();


            const branch =
                document.getElementById(
                    "branch"
                )?.value.trim();


            const course =
                document.getElementById(
                    "course"
                )?.value.trim();


            /* =================================================
               BASIC VALIDATION
               ================================================= */

            if (
                !leaderName ||
                !teammate1Name ||
                !teammate2Name ||
                !email ||
                !year ||
                !branch ||
                !course
            ) {

                alert(
                    "Please fill in all the required fields."
                );

                return;
            }


            /* =================================================
               DISABLE BUTTON
               ================================================= */

            const submitButton =
                registrationForm.querySelector(
                    'button[type="submit"]'
                );


            const originalButtonText =
                submitButton
                    ? submitButton.textContent
                    : "";


            if (submitButton) {

                submitButton.disabled = true;

                submitButton.textContent =
                    "SUBMITTING...";

            }


            try {

                /* =================================================
                   CREATE UNIQUE FILE NAME
                   ================================================= */

                const fileExtension =
                    file.name
                        .split(".")
                        .pop()
                        .toLowerCase();


                const filePath =
                    "payments/" +
                    crypto.randomUUID() +
                    "." +
                    fileExtension;


                /* =================================================
                   UPLOAD PAYMENT SCREENSHOT
                   ================================================= */

                const uploadResult =
                    await supabaseClient
                        .storage
                        .from(
                            "payment-screenshots"
                        )
                        .upload(
                            filePath,
                            file,
                            {
                                cacheControl:
                                    "3600",

                                upsert:
                                    false,

                                contentType:
                                    file.type
                            }
                        );


                if (
                    uploadResult.error
                ) {

                    throw uploadResult.error;

                }


                /* =================================================
                   SAVE REGISTRATION
                   TABLE: institution
                   ================================================= */

                const registrationResult =
                    await supabaseClient
                        .from(
                            "registrations"
                        )
                        .insert({

                            leader_name:
                                leaderName,

                            /*
                             * Your existing Supabase table has an
                             * institution column, but the current
                             * registration form asks for EMAIL
                             * instead.
                             *
                             * Keep the existing column populated
                             * with an empty value so the table
                             * structure is not changed.
                             */
                            institution:
                                email,

                            teammate_1_name:
                                teammate1Name,

                            teammate_2_name:
                                teammate2Name,

                            email:
                                email,

                            year:
                                year,

                            branch:
                                branch,

                            course:
                                course,

                            payment_screenshot:
                                filePath

                        });


                if (
                    registrationResult.error
                ) {

                    /* ---------------------------------------------
                       Remove screenshot if database insertion
                       fails.
                       --------------------------------------------- */

                    await supabaseClient
                        .storage
                        .from(
                            "payment-screenshots"
                        )
                        .remove([
                            filePath
                        ]);

                    throw registrationResult.error;

                }


                /* =================================================
                   SUCCESS
                   ================================================= */

                alert(
                    "Registration successful! 🎉"
                );


                registrationForm.reset();


                if (fileName) {

                    fileName.textContent =
                        "PNG / JPG / WEBP";

                }


                closeModal();


            } catch (error) {

                console.error(
                    "Registration error:",
                    error
                );


                alert(
                    "Something went wrong while submitting your registration. Please try again."
                );

            } finally {

                /* =================================================
                   ENABLE BUTTON AGAIN
                   ================================================= */

                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        originalButtonText;

                }

            }

        }
    );

}


/* =========================================================
   SMOOTH NAVIGATION
   ========================================================= */

const navigationLinks =
    document.querySelectorAll(
        'a[href^="#"]'
    );


navigationLinks.forEach(
    function (link) {

        link.addEventListener(
            "click",
            function (event) {

                const targetID =
                    this.getAttribute(
                        "href"
                    );


                if (
                    !targetID ||
                    targetID === "#"
                ) {

                    return;

                }


                const target =
                    document.querySelector(
                        targetID
                    );


                if (!target) {

                    return;

                }


                event.preventDefault();


                target.scrollIntoView({

                    behavior:
                        "smooth",

                    block:
                        "start"

                });

            }
        );

    }
);