create table
  public.pages (
    id bigint generated by default as identity not null,
    created_at timestamp with time zone not null default now(),
    title text not null,
    content text null,
    author uuid not null,
    institute bigint not null,
    deleted boolean not null default false,
    constraint pages_pkey primary key (id),
    constraint pages_author_fkey foreign key (author) references users (id),
    constraint pages_institute_fkey foreign key (institute) references institutes (id)
  ) tablespace pg_default;