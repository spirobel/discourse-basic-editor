# frozen_string_literal: true

# name: DiscourseBasicEditor
# about: This plugin adds a basic editor to discourse for beginner users.
# version: 0.1
# authors: spirobel
# url: https://github.com/spirobel

register_asset 'stylesheets/common/discourse-basic-editor.scss'
register_asset 'stylesheets/desktop/discourse-basic-editor.scss', :desktop
register_asset 'stylesheets/mobile/discourse-basic-editor.scss', :mobile
register_svg_icon "cat" if respond_to?(:register_svg_icon)
enabled_site_setting :discourse_basic_editor_enabled

PLUGIN_NAME ||= 'DiscourseBasicEditor'

load File.expand_path('lib/discourse-basic-editor/engine.rb', __dir__)

after_initialize do
  [
    "basic_editor",
    "full_editor"
  ].each do |key|
    Site.preloaded_category_custom_fields << key if Site.respond_to? :preloaded_category_custom_fields
    add_to_serializer(:basic_category, key.to_sym) { object.send(key) }
  end
  class ::Category
    def basic_editor
      for x in SiteSetting.basic_editors do
        if x.nil?
          next
        end
        if SiteSetting.public_send(x+"_category") == self.name
           return x
        end
      end
      return ""
    end
    def full_editor
      begin
        return SiteSetting.public_send(self.basic_editor + "_full_editor")
      rescue NoMethodError
        return false
      end
    end
  end

  class ::PostValidator
    def validate(record)
      presence(record)
      return if record.acting_user.try(:staged?)
      return if record.acting_user.try(:admin?) && Discourse.static_doc_topic_ids.include?(record.topic_id)
      return if record.topic_id.nil?
      return if record.topic.category.full_editor && record.is_first_post?
      post_body_validator(record)
      max_posts_validator(record)
      max_mention_validator(record)
      max_images_validator(record)
      max_attachments_validator(record)
      can_post_links_validator(record)
      unique_post_validator(record)
      force_edit_last_validator(record) 
    end
  end
end
