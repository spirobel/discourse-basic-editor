class BasicCategoryHelper
  def self.create_category(name, replace_editor, replace_preview, position=nil)
    category = self.create_category_raw(name, position)
    category.custom_fields['replace_editor'] = replace_editor
    category.custom_fields['replace_preview'] = replace_preview
    category.save_custom_fields(true)
  end
  def self.create_category_raw(name, position=nil)
      return Category.create({"position"=>position,"user_id"=> 1 ,"name"=>name, "color"=>"0088CC", "text_color"=>"FFFFFF", "permissions"=>{"everyone"=>"1"},"required_tag_group_name"=>"", "topic_featured_link_allowed"=>"true", "search_priority"=>"0"}) if position
      return Category.create({"user_id"=> 1 ,"name"=>name, "color"=>"0088CC", "text_color"=>"FFFFFF", "permissions"=>{"everyone"=>"1"},"required_tag_group_name"=>"", "topic_featured_link_allowed"=>"true", "search_priority"=>"0"})
  end
end
