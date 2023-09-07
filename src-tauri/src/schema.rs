// @generated automatically by Diesel CLI.

diesel::table! {
    notes (id) {
        id -> Integer,
        title -> Text,
        content -> Text,
        note_status -> Integer,
        created_at -> Text,
        updated_at -> Text,
    }
}

diesel::table! {
    ziwei_apps (id) {
        id -> Integer,
        app_name -> Text,
        app_id -> Text,
        app_version -> Text,
        local_path -> Text,
        unzipped -> Bool,
        is_running -> Bool,
        created_at -> Text,
    }
}

diesel::allow_tables_to_appear_in_same_query!(
    notes,
    ziwei_apps,
);
