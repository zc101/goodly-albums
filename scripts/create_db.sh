# Create app table and user

sudo mysqladmin -p create GOODLYALBUMS

sudo mysql -Be " \
  uninstall plugin validate_password; \
  CREATE USER 'goodlyalbums-app'@'localhost' \
  IDENTIFIED WITH mysql_native_password BY 'goodlyalbums-app'; \
  GRANT SELECT,INSERT,UPDATE,DELETE \
  ON GOODLYALBUMS.* \
  TO 'goodlyalbums-app'@'localhost'; \
  FLUSH PRIVILEGES;"

# Others: # CREATE,DROP,ALTER,FILE
# Update root user password: UPDATE mysql.user SET Password=PASSWORD('MyNewPass') WHERE User='root';
