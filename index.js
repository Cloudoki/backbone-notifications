(function (root, main) {
  // AMD
  if (typeof define === 'function' && define.amd) {
    define(['backbone', 'mustache', 'underscore', 'jquery'], main);
    // CommonJS
  } else if (typeof module !== 'undefined' && module.exports && typeof require !== 'undefined') {
    module.exports = main(require('backbone'), require('mustache'),
      require('underscore'), require('jquery'));
    // Globals
  } else {
    /* eslint-disable no-param-reassign */
    root.Notifications = main(root.Backbone, root.Mustache, root._, root.$);
    /* eslint-enable no-param-reassign */
  }
})(this, function (Backbone, Mustache, _, $) {
  'use strict';
  // Base plugin without prototype
  var Notifications = Object.create(null);

  /**
   * Base Notifications model exposed on the Notifications Object
   * to be easily replaced
   * @type {Backbone.Model}
   */
  Notifications.Model = Backbone.Model;

  /**
   * Collection of notifications
   * @param {array | Backbone.Model} models
   * @param {object} options
   * @param {Backbone.Model} options.parentModel
   * @param {string} options.url
   * @type {Backbone.Collection}
   */
  Notifications.Collection = Backbone.Collection.extend({
    model: Notifications.Model,
    initialize: function (models, options) {

      this.parentModel = options.parentModel;
      this.parameters = options.parameters;
      this._url = options.url;
    },
    /**
     * Associated collection URL with the parent Model URL
     * @return {string | undefined}
     */
    url: function () {
      var url = this.parentModel ? this.parentModel.url() + '/' +
        (this._url || 'notifications') : (this._url || 'notifications');

        return url + (this.parameters? '?'+$.param(this.parameters): '');
    }
  });

  /**
   * Default templates to use if none are defined
   * @type {Object}
   */
  Notifications.Templates = {
    notification: '<div class="list-group-item">' +
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

  // Initializing the views as an object without prototype
  Notifications.Views = Object.create(null);

  /**
   * Single Notification View
   *
   * @borrows Notifications.Templates.notification  mustache template for the notification view
   *
   * @listens {.close#click} triggers destroy method
   * @listens {[data-role="markread"]#click} triggers markRead method
   *
   * @param {object} options            Backbone.View options
   * @param {object} options.model      this view expects an model
   * @param {object} options.markread   options used on the Notifications.Model.save
   *                                    with patch:true method
   *                                    {@link http://backbonejs.org/#Model-save}
   * @param {object} options.destroy    options used on the Notifications.Model.destroy
   *                                    {@link http://backbonejs.org/#Model-destroy}
   *
   * @return {Backbone.View}
   */
  Notifications.Views.Notification = Backbone.View.extend({
    events: {
      'click .close': 'destroy',
      'click [data-role="markread"]': 'markRead'
    },
    initialize: function (options) {
      var self = this;
      self.options = _.clone(options, true) || {};
      this.templates = options.templates;

      // sets the self.options.save to have a always success property that
      //  will call the save.success if it was provided and
      //  options.destroy.wait is true by default
      self.options.markread = _.defaults({
        // on successfull save
        success: function (model) {
          // remove the notification unread icon and mark as read button
          this.$el.find('.unread').removeClass('unread').addClass('read');
          this.$el.find('[data-role="markread"]').remove();

          /**
           * Indicates that the notification was marked as read
           * @event Notifications.Views.Notification#notification:markread
           * @type {Notifications.Model}
           */
          self.trigger('notification:markread', model);

          // if options.markread.success was provided call it also
          if (options.markread && options.markread.success) {
            options.markread.success.apply(this, arguments);
          }
        }
      }, options.markread, {
        wait: true
      }, {
        patch: true
      });

      // sets the self.options.destroy to have a always success property that
      //  will call the destroy.success if it was provided and
      //  options.destroy.wait is true by default
      self.options.destroy = _.defaults({
        success: function (model) {
          self.remove();
          /**
           * Indicates that the notification was destroyed
           * @event Notifications.Views.Notification#notification:destroy
           * @type {Notifications.Model}
           */
          self.trigger('notification:destroy', model);

          // if options.destroy.success was provided call it also
          if (options.destroy && options.destroy.success) {
            options.destroy.success.apply(this, arguments);
          }
        }
      }, options.destroy, {
        wait: true
      });
    },
    /**
     * Renders notification with template
     *
     * @borrows Notifications.Templates.notification
     *
     * @return {Notifications.View}
     */
    render: function () {
      this.$el.html(Mustache.render(this.templates.notification, this.model.toJSON()));
      // check if the element has the class unread and removes the element with
      // data-role markread if it doesn't
      if (this.$el.find('.unread').length === 0) {
        this.$el.find('[data-role="markread"]').remove();
      }
      return this;
    },
    /**
     * Destroys the notification model and removes the view
     *
     * @fires Notifications.Views#notification:destroy
     */
    destroy: function () {
      this.model.destroy(this.options.destroy);
    },
    /**
     * Patches the model with the unread attribute to false
     *
     * @fires Notifications.Views#notification:markread
     */
    markRead: function () {
      this.model.save({
        unread: false
      }, this.options.markread);
    }
  });

  /**
   * Notification list view, nested view of a collection of NotificationsViews
   *
   * @param {object} options             Backbone.View options
   * @param {Notifications.Collection}   options.collection
   * @param {object} options.templates   Mustache templates to be used for rendering
   *                                     the notification view
   * @param {object} options.fetch       options used on the Notifications.Collections.fetch method
   *                                     {@link http://backbonejs.org/#Collection-fetch}
   *
   * @return {Backbone.View}
   */
  Notifications.Views.List = Backbone.View.extend({
    initialize: function (options) {
      var self = this;
      self.options = _.clone(options, true) || {};
      this.collection = options.collection;
      this.$el.addClass('hidden');
      this.templates = options.templates || Notifications.Templates;
      // sets the self.options.fetch to have a success property
      // that will call the fetch success if provided and sets the
      // options.fetch.wait to true by default
      self.options.fetch = _.defaults({
        // on successful fetch
        success: function (collection, response, opts) {
          // render all the notifications in container
          self.render();

          if (opts.fetch && options.fetch.success) {
            opts.fetch.success.apply(this, arguments);
          }
        }
      }, options.fetch, {
        wait: true
      });
    },
    /**
     * Toggle function that hides or fetches and shows the notifications
     *
     */
    showNotifications: function () {
      if (this.$el.hasClass('hidden')) {
        this.show();
        this.fetch();
      } else {
        this.hide();
      }
    },
    show: function () {
      $('body').addClass('notificationsOn');
      this.$el.removeClass('hidden').addClass('show');
    },
    /**
    * Hides the notifications
    **/
    hide: function () {
      $('body').removeClass('notificationsOn');
      this.$el.removeClass('show').addClass('hidden');
    },
    /**
     * Fetches the notifications and renders them by default in success
     *
     */
    fetch: function () {
      this.$el.html('');
      this.collection.fetch(this.options.fetch);
      this.trigger('notification:fetch', this.collection);
    },
     /**
     * Render a notification by creating a Notification.View and appending the element
     * it renders to the collection element and setups listeners to the Notification.View
     * events that are propagated to the collection
     *
     * @param  {Backbone.model}
     */
    renderNotification: function (item) {
      var self = this;
      var notificationView = new Notifications.Views.Notification({
        model: item,
        templates: this.templates
      });
      notificationView.on('notification:destroy', function (model) {
        self.collection.remove(notificationView.model);
        self.trigger('notification:destroy', model);
      });
      notificationView.on('notification:markread', function (model) {
        self.trigger('notification:markread', model);
      });
      this.$el.append(notificationView.render().el);
    },
    /**
     * Renders the element with created template and appends all notifications
     * in the notifications that are also rendered
     * @return {[type]} [description]
     */
    render: function () {
      this.collection.each(function (item) {
        this.renderNotification(item);
      }, this);
    }
  });

  /**
   * Default initializer for the notifications
   *
   * @param  {object} options              options to use with the collection and views
   *                                       initialization
   * @param  {object} options.parentModel  the model that will parent the notifications
   * @param  {object} options.url          the endpoint where to fetch the notifications from
   * @param  {object} options.templates    the templates used to render the view
   *
   * @return {object}                      instance of Notification with views and
   *                                       collection initialized
   */
  Notifications.init = function (options) {
    var instance = {
      view: {}
    };

    $('[data-role="notifications"]').on('click', function () {
      instance.view.list.showNotifications();
    });

    instance.collection = new Notifications.Collection([], {
      parentModel: options.parentModel,
      parameters: options.parameters,
      url: options.url,
    });

    instance.view.list = new Notifications.Views.List({
      el: '[data-role="notifications-container"]',
      collection: instance.collection,
      templates: options.templates
    });

    return instance;
  };

  return Notifications;
});
