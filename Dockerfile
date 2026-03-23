FROM nginx:alpine
# Copy static files to the Nginx html directory
COPY . /usr/share/nginx/html
# Expose port (Railway overrides this but it's good practice)
EXPOSE 80
