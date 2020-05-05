class DiscourseBasicEditorConstraint
  def matches?(request)
    SiteSetting.discourse_basic_editor_enabled
  end
end
