FROM node:18-alpine

WORKDIR /workspace

# Copy everything
COPY . .

# Build Vite app
RUN cd app && npm install && npm run build

# Prepare the final serving directory
RUN mkdir /www && \
    cp index.html /www/ && \
    cp store.html /www/ && \
    cp styles.css /www/ && \
    cp script.js /www/ && \
    cp -r assets /www/ || true && \
    cp dns_rip.txt /www/ || true && \
    cp -r app/dist /www/app

# Serve it
RUN npm install -g serve
CMD serve -s /www -l tcp://0.0.0.0:$PORT
