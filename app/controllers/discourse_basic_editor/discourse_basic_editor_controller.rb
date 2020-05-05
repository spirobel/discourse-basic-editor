module DiscourseBasicEditor
  class DiscourseBasicEditorController < ::ApplicationController
    requires_plugin DiscourseBasicEditor

    before_action :ensure_logged_in

    def index
    end
  end
end
