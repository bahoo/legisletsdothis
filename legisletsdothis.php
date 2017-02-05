<?php
    /*
        Plugin Name: Legisletsdothis
        Plugin URI: http://jonculver.com/
        Description: Call your legislators.
        Version: 1.0
        Author: Jon Culver
    */

    function legisletsdothis_load_resources() {
           
        global $post;

        if(has_shortcode($post->post_content, 'legisletsdothis')){
            wp_enqueue_script("legisletsdothis-googlemaps", "https://maps.googleapis.com/maps/api/js?key=AIzaSyCyXnRHRgaJSOpF-QuEpecokWC-rR4ynnQ", array(), false, true);
            wp_enqueue_script("legisletsdothis-core-js", plugins_url('legisletsdothis/legisletsdothis.js'), array(), false, true);
            wp_enqueue_style("legisletsdothis-core-css", plugins_url('legisletsdothis/legisletsdothis.css'));
        }
    }
    add_action('wp_enqueue_scripts', 'legisletsdothis_load_resources');

    function init_legisletsdothis($atts, $content = ""){
        $template = <<<END_OF_TEMPLATE

<div id="legisletsdothis" class="lldt-container">

            <div class="lldt-lookup">
                <form id="lldt-form">
                    <h3>Please enter your address:</h3>
                    <input type="text" id="lldt-address-input" />
                    <button type="submit">Find My Legislators</button>
                </form>
            </div>

            <div class="lldt-legislator-widget" id="lldt-legislator-widget" style="display: none;">
                
                <h3>Choose a <span id="lldt-leg-descriptor"></span> legislator to contact:</h3>
                <ul class="lldt-legislators clearfix" id="lldt-legislators">
                </ul>

            </div>

            <div id="lldt-script" style="display: none;">
                <h3>Here's a script you can follow &mdash; feel free to modify it and make it your own!</h3>

                <!-- Cheat Sheet:

                    You can use these variables:
                        [ LEGISLATIVE DISTRICT ]   ( includes ordinal suffix; 1st, 2nd, etc.)

                        [ LEGISLATOR FIRST NAME ]
                        [ LEGISLATOR FULL NAME ]
                 -->


                <div id="lldt-script-text-original" style="display: none;">
                    $content
                </div>

                <div id="lldt-script-text" class="lldt-script-text">
                </div>

                <button id="phone-button">Call</a>
                <button id="email-button">Write an Email</a>

            </div>

        </div>


END_OF_TEMPLATE;

        return $template;
    }
    
    add_shortcode('legisletsdothis', 'init_legisletsdothis');



?>