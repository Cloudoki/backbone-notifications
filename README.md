# Backbone-Notifications

Add Notification with Backbone, rendered with Mustache

##Features

- Customizable generated view Template
- Association with a specific parent model

## Requirements

- [backbonejs](http://backbonejs.org/) and [underscorejs](http://underscorejs.org/)
- [mustache.js](https://github.com/janl/mustache.js)
- [jQuery](https://jquery.com/)

#### Note
The [example](https://github.com/Cloudoki/backbone-notifications/tree/master/examples/notifications) also uses [FontAwesome](http://fortawesome.github.io/Font-Awesome/) and [Twitter Bootstrap](http://getbootstrap.com/) but these are included in it.

## Installation

- **Script Tag:** `<script type="text/javascript" src="https://cdn.rawgit.com/Cloudoki/backbone-notifications/master/index.js"></script>`
- **Bower:** `bower install git://github.com/Cloudoki/backbone-notifications.git`
- **npm:** `npm install github:Cloudoki/backbone-notifications`

##  Usage

### Templates

You need to provide Mustache templates to be able to render the notifications.
- `notification`: The template used to render the notification view. How the notifications will look in the Web page.

```javascript
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
```

The following css classes **must be** defined:
- `unread::before`: to show the unread icon before the notification
- `hidden`: to hide the notifications
- `show`: to show the hidden notifications

```css
  .unread::before {
      content: "\25CF";
      color: #9F9F9F;
      font-size: 200%;
  }
  .hidden {
    display: none;
  }
  .show {
    display: block;
  }
```

### Containers

You will need to provide a container where the notifications will be rendered just like the example bellow.

```html
<div class="list-group" data-role="notifications-container"></div>
```

And add the attribute `data-role="notifications-container"` to the HTML element to make it the container.

### ParentModel

You will need an parent model for the notifications to associate with:

```javascript
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
```

### Initialization

#### Notifications.init(options)

You may use the Notifications.init function for standard use of the plugin

```javascript
  var notifications = Notifications.init({
    parentModel: user,
    templates: templates
  });
```

#### Options

When instantiating Notifications there are a number of options you can configure.
- `parentModel`: The Model that will be the parent of the notifications. **Required**
- `url`: The URL where to get the notifications from. (default - notifications)
- `templates`: The templates for rendering the notifications view.

#### Note:
The URL to get the notifications from will be constructed as 'base URL/parentModel URL/parentModel id/Notifications URL' resulting in the following URL for the example presented 'http://localhost:8080/examples/notifications/accounts/1/notifications'

### Showing the notifications:

To show the notifications an element with the attribute `data-role="notifications` is **required**.

```html
  <button class="btn btn-lg btn-default" data-role="notifications"><i class="fa fa-bell"></i></button>
```
When the element is clicked the plugin will fetch and render the notifications. If clicked again it will hide the notifications.

You can also show and hide the notifications by calling the show/hide methods directly but this will **not fetch** them, only show the ones previously stored and rendered.
Bellow you can see the example of calling the methods directly.

```javascript
// call the show and hide methods directly without fetching the notifications
$('#show').on('click', function(){
  // call show method
  notifications.view.list.show();
});
$('#hide').on('click', function(){
  // call hide method
  notifications.view.list.hide();
});
```

#### Note
When you click to show the notification a class ```notificationsOn``` is added to the body HTML element. This will allow to add dim effects when the notifications are shown.

### Listening to notifications triggered events:

There are 3 events that the notifications view emits:
- **'notification:markread'**: when a notification is marked as read
- **'notification:destroy'**: when a notifications is remove from the collection
- **'notification:fetch'**: when the notifications are fetch successfully

```javascript
  // listening to triggers
 notifications.view.list.on('notification:markread', function(model) {
    console.log('notification markread', model);
  });
  notifications.view.list.on('notification:destroy', function(model) {
    console.log('notification destroyed', model);
  });
  notifications.view.list.on('notification:fetch', function(collection) {
    console.log('notification fetched', collection);
  });
```

### Run Example:
To run the example provided just run the command:
```
npm run example
```
In your browser go to the URL http:127.0.0.1:8080 and you should see a list of links to the files. Click examples > notifications and you'll see the working example.

#### Note 
Since this example is working with dummy data, the 'mark as read' and 'delete' functions will not show any result. They will make DELETE and PATCH request and only update the view on success.
