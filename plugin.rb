# frozen_string_literal: true

# name: DiscourseBasicEditor
# about: This plugin adds a basic editor to discourse for beginner users.
# version: 0.1
# authors: spirobel
# url: https://github.com/spirobel

register_asset 'stylesheets/common/discourse-basic-editor.scss'
register_asset 'stylesheets/desktop/discourse-basic-editor.scss', :desktop
register_asset 'stylesheets/mobile/discourse-basic-editor.scss', :mobile
register_svg_icon "edit" if respond_to?(:register_svg_icon)
register_svg_icon "cat" if respond_to?(:register_svg_icon)

enabled_site_setting :discourse_basic_editor_enabled

PLUGIN_NAME ||= 'DiscourseBasicEditor'

load File.expand_path('lib/discourse-basic-editor/engine.rb', __dir__)

after_initialize do
  [
    "replace_editor",
    "replace_preview"
  ].each do |key|
    Site.preloaded_category_custom_fields << key if Site.respond_to? :preloaded_category_custom_fields
    add_to_serializer(:basic_category, key.to_sym) { object.send(key) }
  end
  Category.register_custom_field_type('replace_editor', :text)
  Category.register_custom_field_type('replace_preview', :text)
  module CategoryEditorReplacement
    def replace_editor
      if self.custom_fields['replace_editor'] != nil
        self.custom_fields['replace_editor']
      else
        return ""
      end
    end
    def replace_preview
      if self.custom_fields['replace_preview'] != nil
        self.custom_fields['replace_preview']
      else
        return ""
      end
    end
  end

  Category.class_eval do
    prepend CategoryEditorReplacement
  end

  module SkipPostValidationsOnEditorReplacement
    def validate(record)
      presence(record)
      return if record.topic_id.nil?
      return if record.topic.category && record.topic.category.custom_fields['replace_editor'] && record.is_first_post?
      super(record)
    end
  end

  class ::PostValidator
    prepend SkipPostValidationsOnEditorReplacement
  end
  module OverridePostCook
    def cook(raw, opts = {})
      t = Topic.find(opts[:topic_id])
      if t.category && t.category.replace_editor != ""
        return super unless self.is_first_post?
        c =(t.category.replace_editor + "_creator").tableize.classify.constantize
        jraw = if raw != "" then JSON.parse(raw) else "" end
        creator = c.new(jraw, opts)
        return creator.create
      end
      return super
    end
  end
  Post.class_eval do
    prepend OverridePostCook
  end
  class ::TopicQuery
  def list_topics_array()
    create_list(:topics)
  end
end
class ::ListController
  def topics_array
    list_opts = build_topic_list_options
    list = TopicQuery.new(current_user, list_opts).send("list_topics_array")
    respond_with_list(list)
  end
end
Discourse::Application.routes.prepend do
   scope "/topics" do
     get "topics_array" => "list#topics_array",as: "topics_array",  defaults: { format: :json }
   end
end
end
