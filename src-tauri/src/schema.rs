// @generated automatically by Diesel CLI.

diesel::table! {
    notes (id) {
        id -> Integer,
        title -> Text,
        content -> Text,
        note_status -> Integer,
        created_at -> Timestamp,
    }
}

diesel::table! {
    ziwei_apps (id) {
        id -> Integer,
        app_name -> Text,
        app_id -> Text,
        app_version -> Text,
        unzipped -> Bool,
        is_running -> Bool,
    }
}

diesel::allow_tables_to_appear_in_same_query!(
    notes,
    ziwei_apps,
);
