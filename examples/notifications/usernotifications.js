/* global Backbone, Mustache, _, $, Notifications */
(function (Backbone, Mustache, _, $, Notifications) {
  'use strict';

  // Notifications test

  var templates = {
    notification: '<div class="list-group-item">' +
                    '<small>This is an example template</small>' +
                    '<button type="button" class="close" aria-label="Close">' +
                      '<span aria-hidden="true"><i class="fa fa-trash-o"></i></span>' +
                    '</button>' +
                    '<div class="row">' +
                      '<div class="col-md-1 col-xs-1 {{state}}" data-role="state"></div>' +
                      '<div class="col-md-2 col-xs-2">' +
                        '<span class="fa-stack fa-lg text-{{type}}">' +
                          '<i class="fa fa-circle fa-stack-2x"></i>' +
                          '<i class="fa cp-{{context}} fa-stack-1x fa-inverse"></i>' +
                        '</span>' +
                      '</div>' +
                      '<div class="col-md-9 col-xs-9">' +
                        '<div class="row">' +
                          '<div class="col-md-12 col-xs-12">' +
                            '{{text}}' +
                          '</div>' +
                          '{{#created_date}}' +
                          '<div class="col-md-6 col-xs-6">' +
                            '<small><i class="fa fa-clock-o fa-fw"></i>{{created_date}}</small>' +
                          '</div>' +
                          '{{/created_date}}' +
                          '{{#created_by}}' +
                          '<div class="col-md-6 col-xs-6">' +
                            '<small>{{created_by}}</small>' +
                          '</div>' +
                          '{{/created_by}}' +
                        '</div>' +
                        '<a class="btn btn-sm pull-right" data-role="markread">mark as read</a>' +
                      '</div>' +
                    '</div>' +
                  '</div>'
  };

  // Creating a model to be the notifications parent
  var User = Backbone.Model.extend({
    // the model must have a urlRoot assigned because this model is not
    //  within a collection
    urlRoot: 'accounts'
  });
  var user = new User({
    id: '1',
    name: 'Jane Doe'
  });

  var notifications = Notifications.init({
    parentModel: user,
    templates: templates
  });

  /* eslint-disable no-console */
  console.log('Notifications test');

  // listening to triggers
  notifications.view.list.on('notification:markread', function (model) {
    console.log('notification markread', model);
  });
  notifications.view.list.on('notification:destroy', function (model) {
    console.log('notification destroyed', model);
  });
  notifications.view.list.on('notification:fetch', function (collection) {
    console.log('notification fetched', collection);
  });
  /* eslint-enable no-console */
  // call the show and hide methods directly without fetching the notifications
  $('#show').on('click', function () {
    // call show method
    notifications.view.list.show();
  });
  $('#hide').on('click', function () {
    // call hide method
    notifications.view.list.hide();
  });
})(Backbone, Mustache, _, $, Notifications);
