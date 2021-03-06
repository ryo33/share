defmodule Share.PageChannel do
  use Share.Web, :channel
  alias Share.UserActions
  alias Share.Follow
  alias Share.User
  alias Share.Post
  alias Share.Fav
  alias Share.Follow
  alias Share.Mystery
  alias Share.Server
  alias Share.Repo

  require Logger

  def join("page", _params, socket) do
    {:ok, socket}
  end

  def handle_in("user_info", %{"name" => name}, socket) do
    case Repo.one(User.local_user_by_name(name)) do
      nil -> {:reply, :error, socket}
      user ->
        res = UserActions.user_info(user, socket.assigns.user)
        {:reply, {:ok, res}, socket}
    end
  end

  def handle_in("remote_user_info", %{"host" => host, "name" => name}, socket) do
    Share.Remote.Message.create(host, "user_info", %{name: name})
    |> Share.Remote.RequestServer.request()
    |> case do
      {:ok, %{"payload" => %{"info" => info}}} ->
        info = info
               |> Map.update!("user", &User.put_host(&1, host))
               |> Map.update!("posts", fn posts ->
                 Enum.map(posts, &Post.put_host(&1, host))
               end)
        {:reply, {:ok, info}, socket}
      _ ->
        {:reply, :error, socket}
    end
  end

  @user_posts_limit 10
  def handle_in("more_user_posts", %{"user" => name, "id" => less_than_id}, socket) do
    case Repo.one(User.local_user_by_name(name)) do
      nil -> {:reply, :error, socket}
      user ->
        query = from p in Post,
          where: p.user_id == ^user.id,
          where: p.id < ^less_than_id,
          order_by: [desc: :id],
          limit: @user_posts_limit
        posts = Repo.all(Post.preload(query))
        favs = Fav.get_favs(posts, socket.assigns.user)
        res = %{
          "posts" => posts,
          "favs" => favs,
        }
        {:reply, {:ok, res}, socket}
    end
  end

  def handle_in("post", %{"id" => id}, socket) do
    case Repo.get(Post, id) do
      nil -> {:reply, :error, socket}
      post ->
        res = %{
          post: Post.deep_preload(post),
          favs: Fav.get_favs([post], socket.assigns.user)
        }
        {:reply, {:ok, res}, socket}
    end
  end

  def handle_in("post_contexts", %{"id" => id}, socket) do
    case Repo.get(Post, id) do
      nil -> {:reply, :error, socket}
      post ->
        post = Repo.preload(post, [:user])
        timeline = Share.UserChannel.get_timeline(post.user, [limit: 10, less_than_id: post.id])
        {:reply, {:ok, timeline}, socket}
    end
  end

  @remote_timeout 4000
  @public_timeline_limit 50
  def handle_in("public_timeline", _params, socket) do
    user = socket.assigns.user
    posts = Post.public_timeline(@public_timeline_limit)
            |> Repo.all()
    favs = Fav.get_favs(posts, user)
    {:reply, {:ok, %{posts: posts, favs: favs}}, socket}
  end

  def handle_in("followers", %{"name" => name}, socket) do
    case Repo.one(User.local_user_by_name(name)) do
      nil -> {:reply, :error, socket}
      user ->
        followers = Repo.all(Follow.get_followers(user.id))
        {:reply, {:ok, %{user: user, followers: followers}}, socket}
    end
  end

  def handle_in("following", %{"name" => name}, socket) do
    case Repo.one(User.local_user_by_name(name)) do
      nil -> {:reply, :error, socket}
      user ->
        following = Repo.all(Follow.get_following(user.id))
        {:reply, {:ok, %{user: user, following: following}}, socket}
    end
  end

  def handle_in("user_mysteries", %{"name" => name}, socket) do
    case Repo.one(User.local_user_by_name(name)) do
      nil -> {:reply, :error, socket}
      user ->
        query = Mystery.user_mysteries(user)
                |> Post.from_mysteries(user)
        mysteries = Repo.all(query)
        {:reply, {:ok, %{user: user, mysteries: mysteries}}, socket}
    end
  end

  def handle_in("opened_mysteries", %{"name" => name}, socket) do
    case Repo.one(User.local_user_by_name(name)) do
      nil -> {:reply, :error, socket}
      user ->
        query = Post.opened_mystery_posts(user)
                |> Post.preload()
        mysteries = Repo.all(query)
        {:reply, {:ok, %{user: user, mysteries: mysteries}}, socket}
    end
  end

  def handle_in("trusted_servers", %{"name" => name}, socket) do
    require Logger
    Logger.info(name)
    case Repo.one(User.local_user_by_name(name)) do
      nil -> {:reply, :error, socket}
      user ->
        servers = Server.trusted_servers(user)
                  |> Repo.all()
        {:reply, {:ok, %{user: user, servers: servers}}, socket}
    end
  end

  def handle_in("ping", _params, socket) do
    {:reply, :ok, socket}
  end
end
