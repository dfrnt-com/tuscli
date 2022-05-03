# Example import using the woql interface

```
npm start -- --woql '
WOQL.and(
  WOQL.and(
    WOQL.get(
      WOQL.as("EmployeeId", "v:_id")
          .as("Name", "v:_name")
          .as("Title", "v:_title")
          .as("Team", "v:_team")
          .as("Manager", "v:_manager")
    ).post("examples/woql/content/Employees.csv"),
    WOQL.typecast("v:_id", "xsd:string", "v:id"),
    WOQL.typecast("v:_name", "xsd:string", "v:name"),
    WOQL.typecast("v:_title", "xsd:string", "v:title"),
    WOQL.typecast("v:_team", "xsd:string", "v:team"),
    WOQL.typecast("v:_manager", "xsd:string", "v:manager"),
    WOQL.idgen("Employee/", ["v:id"], "v:docid"),
  ),
  WOQL.insert_document(
    new WOQL.doc({
      "@type": "Employee",
      "@id": "v:docid",
      "Name": "v:name",
      "Title": "v:title",
      "Team": "v:team",
      "Manager": "v:manager",
    })
  )
)
'
```
