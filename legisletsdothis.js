var legisletsdothis = (function(){

    var self = {

        init: function(){

            self.document = document;
            self.script_tag = self.document.currentScript;
            self.geocoder = new google.maps.Geocoder();

            self.build_widget();
            self.bind();

            return self;

        },

        build_widget: function(){
            self.widget_container = self.document.getElementById('legisletsdothis');
            self.address_input = self.document.getElementById('lldt-address-input');
            self.legislators_list = self.document.getElementById('lldt-legislators')
            self.legislator_template = self.document.getElementById('lldt-legislator-template');
        },

        bind: function(){
            self.lookup_form = self.document.getElementById('lldt-form');
            self.lookup_form.addEventListener('submit', self.handle_lookup_form_submit);
            self.legislators_list.addEventListener('click', self.handle_legislator_click);
            self.legislators_list.addEventListener('mousedown', self.handle_legislator_mouse_down);
            self.document.getElementById('lldt-script').addEventListener('click', self.handle_action_click);

        },

        handle_lookup_form_submit: function(event){
            event.preventDefault();

            if(self.address_input.value == ''){
               alert('Please enter your address');
               self.address_input.focus();
               return;
            }

            // geocode their address
            self.geocoder.geocode({ 'address': self.address_input.value }, function(results, status) {
              if (status == google.maps.GeocoderStatus.OK) {
                self.lookup_legislators(results[0]);
              }
            });
            
        },

        lookup_legislators: function(result){

            var lookup_legislators = new XMLHttpRequest();

            lookup_legislators.open('GET', 'https://openstates.org/api/v1/legislators/geo/?lat=' + result.geometry.location.lat() + '&long=' + result.geometry.location.lng());
            lookup_legislators.send(null);
            lookup_legislators.onreadystatechange = function(){
                var DONE = 4, OK = 200;
                if(lookup_legislators.readyState == DONE && lookup_legislators.status == OK){
                    self.legislators = JSON.parse(lookup_legislators.responseText);
                    self.populate_legislators();
                }
            };

        },

        populate_legislators: function(){

            self.document.getElementById('lldt-legislators').innerHTML = '';

            self.document.getElementById('lldt-legislative-district').innerHTML = self.ordinalize(self.legislators[0].district);

            for(var l = 0; l < self.legislators.length; l++){
                var legislator = self.legislators[l];

                legislator.phone = (legislator.office_phone ? legislator.office_phone : legislator.offices[0].phone).replace(/\D/g, '').match(/^(\d{3})(\d{3})(\d{4})$/).splice(1, 3).join("-");
                legislator.email = (legislator.email ? legislator.email : legislator.offices[0].email);

                legislator.title = legislator.chamber == 'lower' ? 'Representative' : 'Senator';
        legislator.title_abbr = legislator.chamber == 'lower' ? 'Rep.' : 'Sen.';

                var node = self.document.createElement('div');
                node.setAttribute('class', 'row no-gutters');
                node.innerHTML = "<div class=\"col-xs-4 col-sm-3\"><label for=\"legislator-" + legislator.id + "\"><img src=\"" + legislator.photo_url + "\" /></label></div>" +
                                    "<div class=\"col-xs-8 col-sm-9\" style=\"padding-left: 10px;\">" +
                                    "<input id=\"legislator-" + legislator.id + "\" type=\"radio\" name=\"legislator\" value=\"" + legislator.id + "\" data-phone=\"" + legislator.phone + "\" data-email=\"" + legislator.email + "\" />" +
                                    "<p class=\"contact name\"><label for=\"legislator-" + legislator.id + "\">" + legislator.title_abbr + " " + legislator.full_name + "</label></p>" +
                                    "<p class=\"contact phone\"><a href=\"tel:" + legislator.phone + "\">" + legislator.phone + "</a></p>" +
                                    "<p class=\"contact email\"><a href=\"mailto:" + legislator.email + "\">" + legislator.email + "</a></p>" +
                                    "</div>";
                self.legislators_list.appendChild(node);
            }

            self.document.getElementById('lldt-legislator-widget').removeAttribute('style');
            self.track_ga_event('Legislators', 'Looked up', self.ordinalize(self.legislators[0].district));

        },

        handle_legislator_click: function(event){

            if(event && event.target.tagName != 'INPUT'){
                return;
            }

            self.document.getElementById('lldt-script-text-original').setAttribute('style', 'display: none;');
            self.document.getElementById('lldt-actions').removeAttribute('style');
            self.legislator = self.legislators.filter(function(l){ return l.id == event.target.value})[0];
            self.document.getElementById('lldt-script-text').innerHTML = self.format_script(self.document.getElementById('lldt-script-text-original').innerHTML, self.legislator);
            self.document.getElementById('lldt-script-text').removeAttribute('style');
            self.document.getElementById('email-button').innerHTML = 'Write an Email to ' + self.legislator.full_name;
            self.document.getElementById('phone-button').innerHTML = 'Call ' + self.legislator.full_name;

            $.scrollTo('#lldt-script-text', 600);

            self.track_ga_event('Legislators', 'Selected', self.legislator.full_name);

        },

        handle_legislator_mouse_down: function(event){
            if(event.target.tagName == "A"){
                var legislator_id = event.target.parentNode.parentNode.querySelector('input[name="legislator"]').id.replace('legislator-', '');
                self.legislator = self.legislators.filter(function(l){ return l.id == legislator_id})[0];
                self.track_ga_event('Legislators', event.target.parentNode.className, self.legislator.full_name);
            }
        },

        format_script: function(text, legislator){

            var template_variable_map = {
                'legislative district': self.ordinalize(legislator.district) ,
                'legislator first name': legislator.first_name,
                'legislator full name': legislator.full_name,
                'legislator title': legislator.title,
                'legislator title abbr': legislator.title_abbr,
                'legislator name': legislator.title + ' ' + legislator.full_name,
            };

            var matches = text.match(/\[\s?([\w\s]+)\s?\]/g);

            for(var m = 0; m < matches.length; m++){
                 var key = matches[m].replace('[', '').replace(']', '').trim().toLowerCase();
                 if(template_variable_map.hasOwnProperty(key)){
                    text = text.replace(RegExp('\\\[\\\s?' + key + '\\\s?\\\]', 'gi'), template_variable_map[key]);
                 }
            }

            return text;

        },

        ordinalize: function(int){
            var test = int.toString();
            if(test[-1] == '1'){
                return int + "st";
            } else if(test[-1] == '2'){
                return int + "nd";
            } else{
                return int + "th";
            }
        },

        handle_action_click: function(event){
            if(event.target.tagName != 'BUTTON'){
                return;
            }

            if(event.target.id == 'phone-button'){
                window.location.href = "tel:" + self.legislator.phone;
            } else if(event.target.id == 'email-button'){
                window.location.href = "mailto:" + self.legislator.email + "?subject=Amply Funding Basic Education&body=" + self.document.getElementById('lldt-script-text').innerHTML.trim().split('\n').map(function(m){ return m.trim(); }).join('\n').replace(/ +/gi, ' ').replace(/\n/gi, '%0D%0A');
            }
        },

        track_ga_event: function(category, action, label, value){
            return ga && ga('send', 'event', category, action, label);
        }

    };

    return self.init();

})();