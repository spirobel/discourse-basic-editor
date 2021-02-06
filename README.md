# DiscourseBasicEditor

Hi, I am working on a plugin at the moment that replaces the standard editor with a wysiwg editor. I think its easier for beginner users like myself and others.  Please checkout the thread on meta for more details

## Installation

Follow [Install a Plugin](https://meta.discourse.org/t/install-a-plugin/19157)
how-to from the official Discourse Meta, using `git clone https://github.com/spirobel/discourse-basic-editor.git`
as the plugin command.

## Usage

## Feedback

If you have issues or suggestions for the plugin, please bring them up on
[Discourse Meta](https://meta.discourse.org/t/discourse-basic-editor-beginner-friendly-composer/159431).

## Internals

The discourse basic editor and supporting plugins use pre initializers to provide us with a new perspective on how to use discourse to organize people and data.
It enables us to create boards, in the sense of switchboards or message boards.
Switchboards can be used to connect people and data. This notion is helpful if we want to direct peoples efforts and structure and organize data.
The message board enables people to connect among each other. It creates a place where people can have conversations and a community can grow.
Sometimes the use case leads to a focus on one of these notions and sometimes it leads to a combination or mixture.  
In these pre initializers certain object factories are registered, that can later be looked up, changed or amend. This happens in the actual implementation of our boards. To realize this you will create your own discourse plugin and use its initializer to define, what the interface of your actual board will look like. In conjunction with the basic editor plugin your plugin will result in a user experience that is bespoke to the needs of your application.
To craft this space, where people and data can harmonize, we need to take on two perspectives: the view from the eyes of the user and the view that puts the data in the center. We need to observe the user when he is acting. Through this observation we can compartmentalize the user into different actors. Not every user takes every action. There are different groups of users that have certain sets of actions. Its important to keep the amount of actions per actor low, to not clutter the interface and overwhelm the user.
So we define the actors that will act in the space that we are creating. The actors are defined by a set of actions that they can take, what their homepage and hamburger menu will look like and how the data is displayed to them.
...
