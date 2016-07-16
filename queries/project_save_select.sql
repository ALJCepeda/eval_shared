SELECT  p.id as project_id,
        s.id as save_id,
        s.parent as save_parent,
        d.id as document_id,
        d.extension as document_extension,
        d.content as document_content
FROM project p
JOIN save s ON p.id = s.project
JOIN document d ON p.id = d.project AND s.id = d.save
WHERE p.id IS $1 AND s.id IS $2
