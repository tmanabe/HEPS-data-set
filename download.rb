#!/usr/local/bin/ruby
# coding: utf-8

unless ARGV.length == 3 then

    puts "Usage: ruby #{__FILE__} phantomjs_path json_dir html_dir"
    exit(1)

end

require "csv"
require "json"
# require "parallel"

phantomjs_path = ARGV[0]
json_dir       = ARGV[1].chomp("/")
html_dir       = ARGV[2].chomp("/")
js_path        = "#{File.dirname($0)}/download.js"
csv_path       = "#{File.dirname($0)}/ID_URL_XPath.csv"

Dir.mkdir(html_dir) unless File.exists?(html_dir)

CSV.read(csv_path).each{ |id, url, x_path|
# Parallel.each(CSV.read(csv_path),
#     {:in_processes => Parallel.processor_count}){ |id, url, x_path|

    command = [phantomjs_path, js_path, url, x_path].map{ |s|

        '"' + s + '"'

    }.join(" ")

    buffer = `#{command}`
    rawString, html = buffer.split("\t", 2)

    if $?.success? && 0 < rawString.length then

        json_path = "#{json_dir}/#{id}.json"

        json = open(json_path, "r") { |fd| fd.read }

        obj = JSON.parse(json)

        if rawString.length == obj["contents"].first["to"] then

            obj["rawString"] = rawString

        else

            STDERR.puts("Error: Different rawString length (URL: #{url})")
            next

        end

        json = JSON.pretty_generate(obj)

        open(json_path, "w") { |fd| fd.puts(json) }

        open("#{html_dir}/#{id}.html", "w") { |fd|

            fd.print(html)

        }

    else

        case $?.exitstatus

            when 1 then

                STDERR.puts("Warning: PhantomJS failed to open (URL: #{url}). Redoing.")
                redo

            when 43 then

                STDERR.puts("Error: Forbidden (URL: #{url})")

            else

                STDERR.puts("Error: Internal error (URL: #{url})")

        end

    end

}
