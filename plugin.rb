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
  end
  class ::PostValidator
    def validate(record)
      puts record.inspect
      return

      presence(record)
      return if record.acting_user.try(:staged?)
      return if record.acting_user.try(:admin?) && Discourse.static_doc_topic_ids.include?(record.topic_id)

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
  class ::TopicCreator
    def valid?

      topic = Topic.new(setup_topic_params)
      return true
      # validate? will clear the error hash
      # so we fire the validation event after
      # this allows us to add errors
      valid = topic.valid?

      DiscourseEvent.trigger(:after_validate_topic, topic, self)
      valid &&= topic.errors.empty?

      add_errors_from(topic) unless valid

      valid
    end
  end
end
