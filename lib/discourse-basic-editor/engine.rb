module DiscourseBasicEditor
  class Engine < ::Rails::Engine
    engine_name "DiscourseBasicEditor".freeze
    isolate_namespace DiscourseBasicEditor

    config.after_initialize do
      Discourse::Application.routes.append do
        mount ::DiscourseBasicEditor::Engine, at: "/discourse-basic-editor"
      end
    end
  end
end
