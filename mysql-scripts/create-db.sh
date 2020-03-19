# Create app table and user

sudo mysqladmin -p create GOODLYALBUMS

sudo mysql -Be " \
  GRANT SELECT,INSERT,UPDATE,DELETE \
  ON GOODLYALBUMS.* \
  TO 'goodlyalbums-app'@'localhost' \
  IDENTIFIED BY 'goodlyalbums-app'; \
  FLUSH PRIVILEGES;"

# Others: # CREATE,DROP,ALTER,FILE
# Update root user password: UPDATE mysql.user SET Password=PASSWORD('MyNewPass') WHERE User='root';
