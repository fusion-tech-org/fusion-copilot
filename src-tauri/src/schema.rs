// @generated automatically by Diesel CLI.

diesel::table! {
    env_configs (id) {
        id -> Integer,
        env_name -> Text,
        env_value -> Text,
        env_desc -> Nullable<Text>,
        created_at -> Text,
    }
}

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
    users (id) {
        id -> Integer,
        nickname -> Text,
        uuid -> Text,
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
        tags -> Nullable<Text>,
        created_at -> Text,
    }
}

diesel::allow_tables_to_appear_in_same_query!(
    env_configs,
    notes,
    users,
    ziwei_apps,
);
