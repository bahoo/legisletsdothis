<?php
    /*
        Plugin Name: Legisletsdothis
        Plugin URI: http://jonculver.com/
        Description: Call your legislators.
        Version: 1.0.5
        Author: Jon Culver
    */

    function legisletsdothis_load_resources() {
           
        global $post;

        if(has_shortcode($post->post_content, 'legisletsdothis')){
            wp_enqueue_script("legisletsdothis-googlemaps", "https://maps.googleapis.com/maps/api/js?key=AIzaSyCyXnRHRgaJSOpF-QuEpecokWC-rR4ynnQ", array(), false, true);
            wp_enqueue_script("legisletsdothis-core-js", plugins_url('legisletsdothis/legisletsdothis.js'), array(), '1.0.5', true);
            wp_enqueue_style("legisletsdothis-core-css", plugins_url('legisletsdothis/legisletsdothis.css'), array(), '1.0.5');
        }
    }
    add_action('wp_enqueue_scripts', 'legisletsdothis_load_resources');

    function init_legisletsdothis($atts, $content = ""){
        $template = <<<END_OF_TEMPLATE

<div id="legisletsdothis" class="lldt-container">

    <div class="row">

        <div class="col-sm-8">

            <div id="lldt-script">
                <!-- Cheat Sheet:

                    You can use these variables:
                        [ LEGISLATIVE DISTRICT ]   ( includes ordinal suffix; 1st, 2nd, etc.)
                        [ LEGISLATOR TITLE ]
                        [ LEGISLATOR TITLE_ABBR ]
                        [ LEGISLATOR FIRST NAME ]
                        [ LEGISLATOR FULL NAME ]
                        [ LEGISLATOR NAME ] (full title + full name)
                 -->


                <div id="lldt-script-text-original">
                    $content
                </div>

                <div id="lldt-script-text" class="lldt-script-text" style="display: none;">
                </div>

                <div class="lldt-actions" id="lldt-actions" style="display: none;">
                    <button id="phone-button" class="btn btn-primary">Call</button>
                    <button id="email-button" class="btn btn-primary">Write an Email</button>

                    <p class="text-muted small" style="margin-top: 2em;">Heads up: If the email button doesn't work for you, you can also copy and paste your legislator's email address into a new email, and then copy and paste our script in, and send it to them that way. Easy!</p>
                </div>

            </div>

        </div>

        <div class="col-sm-4 small">

            <div class="lldt-lookup">
                <form id="lldt-form">
                    <h5>Personalize your script!</h5>
                    <p>Please enter your home address to personalize your email or call script.</p>
                    <div class="form-group">
                        <input type="text" class="form-control input-sm" id="lldt-address-input" placeholder="416 Sid Snyder Ave SW, Olympia, WA 98504" />
                    </div>
                    <button type="submit" class="btn btn-sm btn-success">Find My Legislators</button>
                </form>
            </div>

            <div class="lldt-legislator-widget" id="lldt-legislator-widget" style="display: none;">
                
                <h5>You are in the <span id="lldt-legislative-district"></span> Legislative District.</h5>
                <p>Click on a legislator's name or photo, and we'll personalize your script.</p>
                <div class="lldt-legislators clearfix" id="lldt-legislators">
                </div>

            </div>

        </div>

    </div>

</div>


END_OF_TEMPLATE;

        return $template;
    }
    
    add_shortcode('legisletsdothis', 'init_legisletsdothis');



?>