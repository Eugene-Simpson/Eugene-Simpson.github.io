/* global window, document, $, jQuery, Modernizr, define, require */

define([
    'jquery',
    'underscore',
    'storageManager',
    'modal',
    'c_080',
    'customSelect',
    'disclaimers',
    'scrollLock',
    '../c_014',
    'analyticsManager',
    'handlebars',
    'vjs'
], function(
        $,
        _,
        storageManager,
        Modal,
        c_080,
        customSelect,
        disclaimers,
        scrollLock,
        C_014,
        AnalyticsManager,
        Handlebars,
        videojs
    ){
        'use strict';

        var $body = $('body'),
            $root,
            C14,
            html, templateRequest, contentRequest,
            testContainerId = 'TestContainer',
            brandKey = 'nissan',
            mockWindow,
            analyticsManager,
            selectors = {
                'youtubeLightbox' : '.youtube_lightbox',
                'iqiyiLightbox' : '.iqiyi_lightbox'
            };

        $.ajaxSetup({async:false});

        templateRequest = $.get(window.environmentBase + '/components/c_014/html/c_014.hbs');
        contentRequest = $.getJSON(window.environmentBase + '/components/c_014/content/content.json');

        $.when(templateRequest, contentRequest)
            .done(function( templateResponse, contentResponse ){
                loadNested(contentResponse[0].config);
                var template = Handlebars.compile( templateResponse[0] );
                contentResponse[0][brandKey].tvid = "386549000";
                contentResponse[0][brandKey].vid = "0c2340bbe6cce1bde14e94e50cd754ac";
                html = template({
                    "content" : contentResponse[0][brandKey]
                });
            })
            .fail(function( template, content ){
                window.console.warn('Error loading template: ' + JSON.stringify(template) + JSON.stringify(content));
            });

        describe( 'When c_014 loads', function(){

            beforeEach(function(){
                if($("#" +testContainerId).length === 0) {
                    $('<div id="' + testContainerId + '" />')
                        .html(html)
                        .appendTo($body);
                }

                mockWindow = {
                    "_satellite": ""
                };

                analyticsManager = new AnalyticsManager({
                    "HELIOS": window.HELIOS,
                    "window": mockWindow,
                    "_satellite": mockWindow._satellite
                });

                C14 = C14 || new C_014({
                    "HELIOS": window.HELIOS,
                    "analyticsManager": analyticsManager
                });
            });

            it( 'should have initModal function', function(){
                expect(C14.initModal).toEqual(jasmine.any(Function));
            });

            it( 'should have bindEvents function', function(){
                expect(C14.bindEvents).toEqual(jasmine.any(Function));
            });

            it( 'should bind click function on button', function(){
                spyOn(C14.$button, 'on');
                C14.bindEvents();
                expect(C14.$button.on).toHaveBeenCalled();
            });

            it( 'should bind click function on anchor tag', function(){
                spyOn(C14.$link, 'on');
                C14.bindEvents();
                expect(C14.$link.on).toHaveBeenCalled();
            });
        });

        describe( 'When iqiyi button is clicked', function(){
            var target;

            beforeAll(function() {
                target = C14.$root.find(".button");
                target.attr('data-state', C14.settings.state.video);
                target.attr('data-vid', "0c2340bbe6cce1bde14e94e50cd754ac");
                target.attr('data-tvid', "386549000");
                target.trigger("click");
            });

            it( 'there should be a iqiyi lightbox', function(){
                expect( $(selectors.iqiyiLightbox).length ).toEqual(1);
            });

            it( 'close buttons closes lightbox', function(){
                $(selectors.iqiyiLightbox).find('.close').eq(0).trigger('click');
                expect( $(selectors.iqiyiLightbox).length ).toEqual(0);
            });

            it( 'veil closes lightbox', function(){
                $(selectors.iqiyiLightbox).find('.veil').eq(0).trigger('click');
                expect( $(selectors.iqiyiLightbox).length ).toEqual(0);
            });
        });

        describe( 'When youtube button is clicked', function(){
            var target;

            beforeAll(function() {
                target = C14.$root.find(".secondary-cta");
                target.attr('data-state', C14.settings.state.video);
                target.attr('data-vid', "0c2340bbe6cce1bde14e94e50cd754ac");
                target.attr('data-tvid', "");
                spyOn(C14, 'trackActualVideo');
                spyOn(C14, 'closeVideo').and.callThrough();
                spyOn(C14, 'appendVideoContainer').and.callThrough();
                spyOn(C14, 'attachKeyboardHandler');
                spyOn(scrollLock, 'disableGlobalScrolling');
                spyOn(videojs, 'on');
                spyOn(disclaimers, 'renderDisclaimers');
                spyOn(C14, 'showVideo').and.callThrough();
                target.trigger("click");
            });

            afterAll(function(){
                $('#' + testContainerId).remove();
            });

            it( 'should call showVideo function', function(){
                expect(C14.showVideo).toHaveBeenCalled();
            });

            it( 'should call trackActualVideo function', function(){
                expect(C14.trackActualVideo).toHaveBeenCalled();
            });

            it( 'should call appendVideoContainer function', function(){
                expect(C14.appendVideoContainer).toHaveBeenCalled();
            });

            it( 'should call attachKeyboardHandler function', function(){
                expect(C14.attachKeyboardHandler).toHaveBeenCalled();
            });

            it( 'should call disableGlobalScrolling function', function(){
                expect(scrollLock.disableGlobalScrolling).toHaveBeenCalled();
            });

            it( 'should call videojs event binder function', function(){
                expect(videojs.on).toHaveBeenCalled();
            });

            it( 'there should be a youtube lightbox', function(){
                expect( $(selectors.youtubeLightbox).length ).toEqual(1);
            });

            it( 'close buttons closes lightbox', function(){
                $(selectors.youtubeLightbox).find('.close').eq(0).trigger('click');
                expect( $(selectors.youtubeLightbox).length ).toEqual(0);
            });

            it( 'veil closes lightbox', function(){
                $(selectors.youtubeLightbox).find('.veil').eq(0).trigger('click');
                expect( $(selectors.youtubeLightbox).length ).toEqual(0);
            });

        });

});
