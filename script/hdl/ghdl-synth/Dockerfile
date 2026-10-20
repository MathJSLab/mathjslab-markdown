FROM --platform=linux/amd64 ubuntu:24.04@sha256:68ee22004a9109b44973313b02ff7b1de250f1de0f5ecb628d73f579aaff33ac

ENV DEBIAN_FRONTEND=noninteractive

COPY build-packages.lock /opt/ghdl-build-packages.lock
# Pin the complete installed closure, not just the directly requested tools.
# Missing historical versions fail the build instead of selecting replacements.
RUN rm -f /etc/apt/apt.conf.d/docker-clean \
  && apt-get update \
  && xargs apt-get install --download-only -y --no-install-recommends < /opt/ghdl-build-packages.lock \
  && (cd /var/cache/apt/archives && sha256sum *.deb > /opt/ghdl-build-debs.sha256) \
  && xargs apt-get install --no-download -y --no-install-recommends < /opt/ghdl-build-packages.lock \
  && dpkg-query -W -f='${binary:Package}=${Version}\n' > /opt/ghdl-installed-packages.lock \
  && diff -u /opt/ghdl-build-packages.lock /opt/ghdl-installed-packages.lock \
  && rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*.deb

ENV PATH=/usr/lib/llvm-16/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
