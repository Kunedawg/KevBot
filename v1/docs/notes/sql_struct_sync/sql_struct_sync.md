# How to sync test and production server structures with MySQL Workbench

1. Export the test servers structure. Make sure dump structure only is selected and make sure all the tables are selected. Export to a self-contained file and check the single transaction box.

    ![](1.png)

2. Export the production server structure as you did in step 1 for the test server.

    ![](2.png)

3. Run the removeDefiners.js script on both the test and production structure dumps. This produces two new files but with "_definers_removed" appended to the name.

    ![](3.png)

4. Goto the database tab and select "Reverse Engineer". This will open the MySQL Model tab.

    ![](4.png)

5. Cancel out of the window that pops up

    ![](5.png)

6. Go back to the Database tab and select "Synchronize with Any Source"

    ![](6.png)

7. Hit Next. On the "Select Sources" page, select the source file to be the the test structure export and set the destination source to be the production structure export. The ALTER script is what the output script gets saved to. You have the option to copy the script to clipboard later, or you can save it to this file.

    ![](7.png)

8. Hit next until the "Select Schemata" page. Make sure the box is checked, not bulleted.

    ![](8.png)

9. Hit next until the "Select Changes to Apply" page. This will show a summary of the differences.

    ![](9.png)

10. Hit next until the "Detected Changes" page. This shows the script that has been generated. This script when applied to the production server will update it to be in sync with the test server, structure wise. You have the option to hit copy to clipboard and paste it into a text editor, or hit execute for the script to be saved to the alter file.

    ![](10.png)

11. References to AUTO_INCREMENT for tables can be deleted, they are kind of pointless.

    ![](11.png)

12. All references to `default_schema` should be replaced by the production's database name `heroku_7d46a4d7ec18ce3`.

    ![](12.png)
    ![](13.png)
    ![](14.png)

13. Finally, open the production server and go to file "Run SQL Script".

    ![](15.png)

14. Select the schema that should be updated and set the char set to `utf8`. Then hit run. If all goes well a window should pop up that says operation successful. 

    ![](16.png)
