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
Sometimes the usecase leads to a focus on one of these notions and sometimes it leads to a combination or mixture.  
In these pre initializers certain object factories are registered, that can later be looked up, changed or amended. This happens in the actual implementation of our boards. To realize this you will create your own discourse plugin and use its initializer to define, what the interface of your actual board will look like. In conjunction with the basic editor plugin your plugin will result in a user experience that is bespoke to the needs of your application.
To craft this space, where people and data can harmonize, we need to take on two perspectives: the view from the eyes of the user and the view that puts the data in the center. We need to observe the user when he is acting. Through this observation we can compartmentalize the user into different actors. Not every user takes every action. There are different groups of users that have certain sets of actions. Its important to keep the amount of actions per actor low, to not clutter the interface and overwhelm the user.
So we define the actors that will act in the space that we are creating. The actors are defined by a set of actions that they can take, what their homepage and hamburger menu will look like and how the data is displayed to them.

## Actions and reactions

The pencil icon in the nav bar leads to a set of actions that will create new topics. The content of the hamburger menu is replaced with a bunch of reactive calls to action.
An example could be this: Action: Ask people for help! Result: open composer to create new topic in questions category. Reaction: Help People! Result: open questions category.
This will result in a feedback loop between users acting and reacting. Ideally these user groups come from a different kind of target group that can provide value to each other. The reason to switch from the original interface to this is explained in the following parapgraph.
What would happen if the [pidgeon](https://www.youtube.com/watch?v=I_ctJqjlrHA) was exposed to a set of categories of content to actively explore? would it develop superstitons like this [one](https://www.youtube.com/watch?v=8uPmeWiFTIw) ? Would the experiment still work if the inside of the box was cluttered with tons of knobs and buttons or would the pidgeon just become more and more erratic and superstitious?
Its important to keep the user interface as simple as possible so the user behavior stays as predictable as possible.

## Category helper docs

migrations will fail because we need a user account first to create categories. workaround:
install discourse
do skip_post_migrate
create admin account: rake admin:create
then migrate d/migrate
